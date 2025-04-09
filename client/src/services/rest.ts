import { StatusCodes } from 'http-status-codes'

import {
  AlleHjelpemidlerMedDelerResponse,
  DelbestillerrolleResponse,
  DelbestillingResponse,
  DellisteResponse,
  HjelpemiddelTitlerResponse,
  OppslagResponse,
  SisteBatteribestillingResponse,
  XKLagerResponse,
} from '../types/HttpTypes'
import { Delbestilling, DelbestillingSak, Valg } from '../types/Types'

export const REST_BASE_PATH = '/hjelpemidler/delbestilling'
export const API_PATH = REST_BASE_PATH + '/api'
export const ROLLER_PATH = REST_BASE_PATH + '/roller'

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

const hjelpemiddelOppslag = async (hmsnr: string, serienr: string): Promise<OppslagResponse> => {
  const brukEksternDevOppslag = window.appSettings.USE_MSW === true && window.location.hostname !== 'localhost'

  const path = brukEksternDevOppslag ? '/oppslag-ekstern-dev' : '/oppslag'

  const response = await fetchPost(API_PATH + path, {
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

const hentHjelpemiddelTitler = async (): Promise<HjelpemiddelTitlerResponse> => {
  const response = await fetch(API_PATH + '/hjelpemiddel-titler')
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

const hentSisteBatteribestilling = async (
  hmsnr: string,
  serienr: string
): Promise<SisteBatteribestillingResponse | undefined> => {
  const response = await fetch(API_PATH + `/siste-batteribestilling/${hmsnr}/${serienr}`)
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

const sjekkXKLager = async (hmsnr: string, serienr: string): Promise<XKLagerResponse> => {
  const response = await fetchPost(`${API_PATH}/xk-lager`, {
    body: JSON.stringify({ hmsnr, serienr }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
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

export default {
  hjelpemiddelOppslag,
  hentAlleHjelpemidlerMedDeler,
  hentHjelpemiddelTitler,
  hentAlleDeler,
  sendInnBestilling,
  hentBestillinger,
  hentBestillingerForBruker,
  hentBestillingerForKommune,
  hentRolle,
  sjekkLoginStatus,
  sjekkXKLager,
  hentSisteBatteribestilling,
}
