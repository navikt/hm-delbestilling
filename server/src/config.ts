import path from 'path'

const tokenx = {
  discoveryUrl: process.env.TOKEN_X_WELL_KNOWN_URL || 'http://localhost:8080/default/.well-known/openid-configuration',
  clientID: process.env.TOKEN_X_CLIENT_ID || 'debugger',
  privateJwk: undefined,
  redirectUri: undefined,
}

export type TokenXConfig = typeof tokenx

const idporten = {
  discoveryUrl: process.env.IDPORTEN_WELL_KNOWN_URL || 'http://localhost:8080/default/.well-known/openid-configuration',
}

export type IDPortenConfig = typeof idporten

const idportenLocal = {
  discoveryUrl: 'http://host.docker.internal:8080/default/.well-known/openid-configuration',
  clientID: 'local',
  redirectUri: 'http://localhost:5000/hjelpemidler/delbestilling/oauth2-local/callback',
  domain: process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'nav.no' : 'dev.nav.no',
  responseType: ['code'],
  scope: 'openid profile',
}

export type IDPortenLocalConfig = typeof idportenLocal

if (process.env.NODE_ENV === 'production' && process.env.USE_MSW !== 'true') {
  tokenx.privateJwk = process.env.TOKEN_X_PRIVATE_JWK && JSON.parse(process.env.TOKEN_X_PRIVATE_JWK) // TOKEN_X_PRIVATE_JWM is undefined locally
} else {
  tokenx.privateJwk = JSON.parse(
    '{"p": "2woV2ppiatuKVIkN5XIspw7SHN44Ux-HXLzAbnk2SpQZ2TpyKz9Ucc4yx4WeIDU4-V8xMloMzSTE_JOS2me_p9Rim_MdYyZRHJF4O0moZO7TAL0wxBnKtpqAlWIHC4-URYGDcsA2YkHXOP0ah0zZsBqGWGcXtoll5pXoKM5klR0","kty": "RSA","q": "y_8F3D4fPr-ZrWcaksDnqdptRI-rZg-s0IX4MjgtYNzMTFcFYG42Gy0RgFgq4c7vm_D44Z0R_t55aPpVOQlE4NWCbzeb4xs2HQUZ0AGXt3o23XElParwORPrlGARuRHTANENMjYZx2ln6ee-4nULBpUSghubsr29ejeJ8YwQLCc","d": "YluY-vbs31GbHZt0gQxKA9oN_8vOJKJ3DgxkSMu1q00wxqSwNwLOwc1i2O1hBwi9hWPptKrtjpXtcr7wryuqRONF_6menNox4-1BafhE-tdnKpkJ7gTIT2XKDbPYKm09uK3kHwP2OajVoJrRkJvDQIm0npIiuDgJn5wOUcJW2XHmACWTzRZoSjmDLxkNxwK-j6DW8jMLAWQm42m2ac--GVEt5HqjPTxFXoz1WXHYuukq6Tf6U22vsqxLbwzAGdQK5ajFRBhH4-Mk9P5DpAJIdylfo5NA48uS3hW1wwfwVil6WZcClkvHptuxgmHqJ5D-jfkMxrrXRlVqX23yxmbgeQ", "e": "AQAB","use": "sig","kid": "FV0IhjCe6pDGchEdWfjGZYTuE-Jq4vDSk27tn8SVZS8","qi": "NNeLF_22Le1jX1F26APT027VXfwGnBej_4sAHiPzONBC8PagMp3GycMCqqS-h0ii0oX2Ba0nxR1hwvWpcYAqzDrqg5amxqFiBrNfai7J5sRiRCPUxnVhG9GFoPB2kVnLuYikfRnZMFgviSfxvwsWhaY-fQYDU2lKlcL6gC9S2Qg","dp": "oZ0AYOnWQee4WgVBtpCWd7CMwPYJcvNpabhu91QCBebeZ5QjFtvET7AHcYWaFUOPxRdCcldU6Kv_mCi-it1P4OHo3A32Gej0ofKHVp9TWx2HnBz7dUVed3rp8s6ASjxm9x3HQgymU7smtIqzXy8J01DO3T07ltgr0oW65Rjbx9U","alg": "RS256","dq": "Sl1-cmqHE2XfjPIgIs2F5kqFONAzCHLAagfckdoe2MfFBjNW929V9BQ65BHAGC9K9Aslf4G19LZ_hgB0HuW9IUVUVlzsTB84W93nKgfamf1IkPNVQyTUi8oyQBXBgDj6Nbr_14UXYrWPNxrPYFiQm2aup5WO7drzfuFOPSr1HlM","n": "roszY8FrDNkYNR2iaOJjOTH074yjyeh4niAcUWE8eTdZ8IY_geq0KbP2T7tOGp3epRW9Kstv93vvSPlnY6XQE7mQkfRNCzbic0xkLHVrDmLgOzokG78F7Y_d3TOQqZ4_hduyUGyBf4TGSdrfzC_NER8R0t10JUHJ_5wOYBgEIUG7yjLmoa1SaGQoX1xDb0zHp_50Nv8FvFurYe66xGlRitU9zniMfPBLKZLfkM7zHjbx3qzoD9NS6KyGD2ULV5e6zLRBu8M1KcerU6w651ysaJuPX1tznhFOAe1yqmF-HQ8wN6MljpSimzj7vk-nQM18YAC9SMvlAW-z4S7S6MOzaw"}'
  )
}

const app = {
  sessionSecret: process.env.SESSION_SECRET,
  useSecureCookies: !!process.env.NAIS_CLUSTER_NAME,
  port: process.env.PORT || 5000,
  targetAudienceAPI: process.env.DELBESTILLING_API_AUDIENCE || 'local:hjelpemidlerdigitalsoknad-api',
  cluster: process.env.NAIS_CLUSTER_NAME || '',
  redirectUrl: process.env.REDIRECT_URL,
  targetAudienceRoller: process.env.ROLLER_AUDIENCE || 'local:hm-roller',
}

const session = {
  secret: process.env.SESSION_SECRET || 'tullescret',
  maxAgeMs: Number(process.env.SESSION_MAX_AGE_MS) || 12 * 60 * 60 * 1000, // defaults to 12 hours
}

export type AppConfig = typeof app

export const config = {
  app,
  tokenx,
  idporten,
  idportenLocal,
  session,
  basePath: '/hjelpemidler/delbestilling',
  buildPath() {
    return path.join(__dirname, '../../client/dist')
  },
  loginservice: {
    loginServiceUrl: process.env.LOGINSERVICE_URL,
  },
  isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  isMocked() {
    return process.env.USE_MSW === 'true'
  },
  isProdCluster() {
    return process.env.NAIS_CLUSTER_NAME === 'prod-gcp'
  },
}
