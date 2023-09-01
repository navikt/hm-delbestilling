import type { RequestHandler } from 'express'
import { createRemoteJWKSet, FlattenedJWSInput, JWSHeaderParameters, jwtVerify } from 'jose'
import { GetKeyFunction } from 'jose/dist/types/types'
import jwt, { JwtPayload } from 'jsonwebtoken'
import jose from 'node-jose'
import { Client, Issuer, TokenSet } from 'openid-client'
import { ulid } from 'ulid'
import type { AppConfig, IDPortenConfig, TokenXConfig } from './config'
import { config } from './config'
import { debugLogger } from './logger'

let tokenxConfig: Nullable<TokenXConfig> = null
let tokenxClient: Nullable<Client> = null
let tokenxMetadata: Nullable<Issuer<Client>> = null
let idportenConfig: Nullable<IDPortenConfig> = null
let idportenMetadata: Nullable<Issuer<Client>> = null
let idportenRemoteJWKSet: Nullable<GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>> = null
let appConfig: Nullable<AppConfig> = null

async function setup(idpConfig: IDPortenConfig, txConfig: TokenXConfig, appConf: AppConfig): Promise<void> {
  if (config.isMocked()) return
  else {
    idportenConfig = idpConfig
    tokenxConfig = txConfig
    appConfig = appConf

    const { tokenx } = await init()
    tokenxClient = tokenx
  }
}

async function init() {
  if (idportenConfig == null || tokenxConfig == null) {
    throw new Error('setup() må kalles først')
  }

  try {
    const idporten = await Issuer.discover(idportenConfig.discoveryUrl)
    const tokenx = await Issuer.discover(tokenxConfig.discoveryUrl)
    tokenxMetadata = tokenx
    idportenMetadata = idporten

    idportenRemoteJWKSet = createRemoteJWKSet(new URL(<string>idportenMetadata.metadata.jwks_uri))

    const redirectUris: string[] = []
    tokenxClient = new tokenx.Client({
      client_id: tokenxConfig.clientID,
      redirect_uris: tokenxConfig.redirectUri ? redirectUris.concat(tokenxConfig.redirectUri) : redirectUris,
      token_endpoint_auth_method: 'none',
    })

    return Promise.resolve({ tokenx: tokenxClient })
  } catch (err) {
    return Promise.reject(err)
  }
}

async function exchangeToken(selvbetjeningsToken: string, targetAudience: string): Promise<TokenSet> {
  if (tokenxClient == null || appConfig == null) {
    throw new Error('setup() må kalles først')
  }

  const clientAssertion = await createClientAssertion()
  return tokenxClient
    .grant({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      token_endpoint_auth_method: 'private_key_jwt',
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      client_assertion: clientAssertion,
      audience: targetAudience,
      subject_token: selvbetjeningsToken,
    })
    .then((tokenSet) => {
      return Promise.resolve(tokenSet)
    })
    .catch((err) => {
      console.log(`Error while exchanging token: ${err}`)
      return Promise.reject(err)
    })
}

async function createClientAssertion() {
  if (tokenxConfig == null || tokenxMetadata == null) {
    throw new Error('setup() må kalles først')
  }

  const now = Math.floor(Date.now() / 1000)
  return jwt.sign(
    {
      sub: tokenxConfig.clientID,
      aud: tokenxMetadata.token_endpoint,
      iss: tokenxConfig.clientID,
      exp: now + 60, // max 120
      iat: now,
      jti: ulid(),
      nbf: now,
    },
    await privateKeyToPem(tokenxConfig.privateJwk || ''),
    { algorithm: 'RS256' }
  )
}

async function privateKeyToPem(jwk: string) {
  const key = await jose.JWK.asKey(jwk)
  return key.toPEM(true)
}

type ClaimKey = keyof JwtPayload
type ClaimValue = JwtPayload[ClaimKey]

function claimGetter<V extends ClaimValue = ClaimValue, K extends ClaimKey = ClaimKey>(
  claim: K
): (token?: string) => Maybe<JwtPayload[K]> {
  return (token) => {
    if (!token) return
    const decoded = jwt.decode(token)
    if (decoded == null || typeof decoded === 'string') return
    return decoded[claim]
  }
}

const getExp = claimGetter('exp')

export const auth = {
  setup,
  exchangeToken,
  tokenIsValid(token?: string): token is string {
    const exp = getExp(token) || 0
    return Date.now() < exp * 1000
  },
  getExp(token?: string) {
    return getExp(token)
  },
  getSid: claimGetter<string>('sid'),
}

declare module 'express-serve-static-core' {
  interface Request {
    isAuthenticated?: boolean
  }

  interface Response {}
}

const setIsAuthenticated: RequestHandler = async (req, res) => {
  if (!config.isProduction()) {
    const tokenSet = req.session.tokens && new TokenSet(req.session.tokens)
    if (tokenSet !== undefined && tokenSet !== null) {
      req.headers.authorization = 'bearer ' + tokenSet.access_token
    }
  }

  const bearerToken: string | null | undefined = req.headers.authorization
  if (!bearerToken) {
    req.isAuthenticated = false
    return
  }

  try {
    await verifyIdportenAccessToken(bearerToken)
  } catch (e) {
    req.isAuthenticated = false
    return
  }
  req.isAuthenticated = true

  debugLogger('req.isAuthenticated is %s', req.isAuthenticated)
}

async function verifyIdportenAccessToken(bearerToken: string) {
  const token = bearerToken.split(' ')[1]
  const verified = await validerToken(token)

  if (verified.payload.client_id !== process.env.IDPORTEN_CLIENT_ID) {
    throw new Error('client_id matcher ikke min client ID')
  }

  const aksepterteAcrs = ['Level4', 'idporten-loa-high']

  if (!aksepterteAcrs.includes(verified.payload.acr as any)) {
    throw new Error('Har ikke godkjent acr')
  }
}

async function validerToken(token: string | Uint8Array) {
  if (idportenRemoteJWKSet == null) {
    throw new Error('setup() må kalles først')
  }
  return jwtVerify(token, idportenRemoteJWKSet)
}

const requiresValidToken = (): RequestHandler => async (req, res, next) => {
  await setIsAuthenticated(req, res, next)
  if (config.isMocked() || req.isAuthenticated) {
    debugLogger('requiresValidToken: token present or not required, calling next()')
    next()
  } else {
    debugLogger('requiresValidToken: token not present or invalid, returning 401')
    res.sendStatus(401)
  }
}

const requiresLogin = (): RequestHandler => async (req, res, next) => {
  await setIsAuthenticated(req, res, next)

  if (config.isMocked() || req.isAuthenticated) {
    debugLogger('requiresLogin: token present or not required, calling next()')
    next()
  } else {
    debugLogger('requiresLogin: token not present or invalid, redirecting to login page')
    res.redirect(`${config.basePath}/oauth2/login?redirect=${config.app.redirectUrl}/utsjekk`)
  }
}

const loginHandler = (): RequestHandler => (req, res) => {
  const redirect = req.query.redirect || 'utsjekk'
  res.redirect(`${config.basePath}/oauth2/login?redirect=${config.app.redirectUrl}/${redirect}`)
}

const logoutHandler = (): RequestHandler => (req, res) => {
  res.redirect(`${config.basePath}/oauth2/logout`)
}

export const authMiddleware = {
  requiresValidToken,
  requiresLogin,
  logout: logoutHandler,
  login: loginHandler,
}
