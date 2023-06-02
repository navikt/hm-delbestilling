import { DelbestillerResponse, OppslagResponse } from '../types/ResponseTypes'
import { InnsendtBestilling } from '../types/Types'

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
    return this.statusCode === 401
  }

  isForbidden(): boolean {
    return this.statusCode === 403
  }
}

const handleResponse = async (response: Response) => {
  if (response.status >= 400 && response.status < 500) {
    const error = await response.json().catch((err: unknown) => console.log('ApiError thrown in handleResponse()', err))
    const message = error ? error.message : 'ApiError thrown in handleResponse()'
    throw new ApiError(message, response.status)
  }
  if (!response.ok) {
    throw new ApiError('Feil ved kontakt mot baksystem.', response.status)
  }
}

const fetchPost: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (url, otherParams) => {
  return fetch(url, { method: 'POST', ...otherParams })
}

const hjelpemiddelOppslag = async (artnr: string, serienr: string): Promise<OppslagResponse> => {
  const response = await fetchPost(API_PATH + '/oppslag', {
    body: JSON.stringify({ artnr, serienr }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await handleResponse(response)

  return await response.json()
}

const hentBestillingerForBruker = async (): Promise<InnsendtBestilling[]> => {
  const response = await fetch(API_PATH + '/delbestilling')
  await handleResponse(response)
  return await response.json()
}

const hentBestillingerForKommune = async (): Promise<InnsendtBestilling[]> => {
  const response = await fetch(API_PATH + '/delbestilling/kommune')
  await handleResponse(response)
  return await response.json()
}

const sendInnBestilling = async (bestilling: InnsendtBestilling): Promise<string> => {
  const response = await fetchPost(`${API_PATH}/delbestilling`, {
    body: JSON.stringify(bestilling),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await handleResponse(response)

  const id = await response.text()
  return id
}

const hentRolle = async (): Promise<DelbestillerResponse> => {
  const response = await fetch(`${ROLLER_PATH}/delbestiller`)
  await handleResponse(response)
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
  sendInnBestilling,
  hentBestillingerForBruker,
  hentBestillingerForKommune,
  hentRolle,
  sjekkLoginStatus,
}
