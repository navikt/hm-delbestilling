import { StatusCodes } from 'http-status-codes'

import {
  AlleHjelpemidlerMedDelerResponse,
  DelbestillerrolleResponse,
  DelbestillingResponse,
  DellisteResponse,
  OppslagResponse,
} from '../types/HttpTypes'
import {
  Delbestilling,
  DelbestillingSak,
  Kommune,
  Tilgang,
  Tilgangsforespørsel,
  Tilgangsforespørselgrunnlag,
  Tilgangsforespørselstatus,
  Valg,
} from '../types/Types'

export const REST_BASE_PATH = '/hjelpemidler/delbestilling'
export const API_PATH = REST_BASE_PATH + '/api'
export const ROLLER_PATH = REST_BASE_PATH + '/roller'
export const OPPSLAG_PATH = REST_BASE_PATH + '/oppslag'

export class ApiError extends Error {
  statusCode: number | undefined

  constructor(message: string, statusCode?: number) {
    super(message)
    this.statusCode = statusCode
  }

  isUnauthorized(): boolean {
    return this.statusCode === StatusCodes.UNAUTHORIZED
  }

  isTooManyRequests(): boolean {
    return this.statusCode === StatusCodes.TOO_MANY_REQUESTS
  }
}

const handleResponse = async (response: Response) => {
  // Catcher statuskoder utenfor 200-299
  if (!response.ok) {
    const json = await response.json().catch((err: unknown) => {})
    // Responsebody inneholder ikke en feil som klienten skal håndtere, så kast ApiError
    if (json?.feil === undefined) {
      throw new ApiError(response.statusText, response.status)
    }
  }
}

const fetchPost: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (url, otherParams) => {
  return fetch(url, { method: 'POST', ...otherParams })
}

const fetchDelete: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (url, otherParams) => {
  return fetch(url, { method: 'DELETE', ...otherParams })
}

const fetchPut: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (url, otherParams) => {
  return fetch(url, { method: 'PUT', ...otherParams })
}

const hjelpemiddelOppslag = async (hmsnr: string, serienr: string): Promise<OppslagResponse> => {
  const response = await fetchPost(API_PATH + '/oppslag', {
    body: JSON.stringify({ hmsnr, serienr }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await handleResponse(response.clone())

  return await response.json()
}

const hentAlleHjelpemidlerMedDeler = async (): Promise<AlleHjelpemidlerMedDelerResponse> => {
  const response = await fetch(API_PATH + '/hjelpemidler')
  await handleResponse(response.clone())
  return await response.json()
}

const hentAlleDeler = async (): Promise<DellisteResponse> => {
  const response = await fetch(API_PATH + '/deler')
  await handleResponse(response.clone())
  return await response.json()
}

const hentBestillinger = async (valg: Valg): Promise<DelbestillingSak[] | undefined> => {
  let bestillinger: DelbestillingSak[] | undefined = undefined
  if (valg === 'mine') {
    bestillinger = await hentBestillingerForBruker()
  } else if (valg === 'kommunens') {
    bestillinger = await hentBestillingerForKommune()
  }
  return bestillinger
}

const hentBestillingerForBruker = async (): Promise<DelbestillingSak[]> => {
  const response = await fetch(API_PATH + '/delbestilling')
  await handleResponse(response.clone())
  return await response.json()
}

const hentBestillingerForKommune = async (): Promise<DelbestillingSak[]> => {
  const response = await fetch(API_PATH + '/delbestilling/kommune')
  await handleResponse(response.clone())
  return await response.json()
}

const sendInnBestilling = async (delbestilling: Delbestilling): Promise<DelbestillingResponse> => {
  const response = await fetchPost(`${API_PATH}/delbestilling`, {
    body: JSON.stringify({ delbestilling }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await handleResponse(response.clone())
  return await response.json()
}

const hentRolle = async (): Promise<DelbestillerrolleResponse> => {
  const response = await fetch(`${ROLLER_PATH}/delbestiller`)
  await handleResponse(response.clone())
  return await response.json()
}

const hentTilgangsforespørselgrunnlag = async (): Promise<Tilgangsforespørselgrunnlag> => {
  const response = await fetch(`${ROLLER_PATH}/tilgang/grunnlag`)
  await handleResponse(response.clone())
  return await response.json()
}

const sendTilgangsforespørsler = async (tilgangsforespørsler: Tilgangsforespørsel[]): Promise<string> => {
  const response = await fetchPost(`${ROLLER_PATH}/tilgang/foresporsel`, {
    body: JSON.stringify({ forespørsler: tilgangsforespørsler }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await handleResponse(response.clone())
  return await response.text()
}

const slettTilgangsforespørsel = async (id: string): Promise<string> => {
  const response = await fetchDelete(`${ROLLER_PATH}/tilgang/foresporsel/${id}`)
  await handleResponse(response.clone())
  return await response.text()
}

const oppdaterTilgangsforespørselstatus = async (id: string, status: Tilgangsforespørselstatus): Promise<string> => {
  const response = await fetchPut(`${ROLLER_PATH}/tilgang/foresporsel/status`, {
    body: JSON.stringify({ id, status }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await handleResponse(response.clone())
  return await response.text()
}

const hentTilganger = async (): Promise<Tilgang[]> => {
  const response = await fetch(`${ROLLER_PATH}/tilgang?rettighet=DELBESTILLING`)
  await handleResponse(response.clone())
  return await response.json()
}

const sjekkLoginStatus = async (): Promise<boolean> => {
  const response = await fetch(`${REST_BASE_PATH}/auth/status`)

  if (response.status === 401) {
    return false
  }

  if (!response.ok) {
    throw Error(response.statusText)
  }

  return true
}

export interface Kommuner {
  [kommunenr: string]: Kommune
}

const hentKommuner = async (): Promise<Kommuner> => {
  const response = await fetch(`${OPPSLAG_PATH}/geografi/kommuner`)
  await handleResponse(response.clone())
  return await response.json()
}

export default {
  hjelpemiddelOppslag,
  hentAlleHjelpemidlerMedDeler,
  hentAlleDeler,
  sendInnBestilling,
  hentBestillinger,
  hentBestillingerForBruker,
  hentBestillingerForKommune,
  hentRolle,
  sjekkLoginStatus,
  hentTilgangsforespørselgrunnlag,
  sendTilgangsforespørsler,
  slettTilgangsforespørsel,
  hentTilganger,
  oppdaterTilgangsforespørselstatus,
  hentKommuner,
}
