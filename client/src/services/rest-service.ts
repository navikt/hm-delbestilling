import { BASE_PATH } from '../App'
import { DkifResponse } from '../interfaces/Dkif'
import { logAmplitudeEvent, digihot_customevents } from '../utils/amplitude'
import { ApiError } from '../types/errors'

export const API_PATH_BASE = '/hjelpemidler/digitalsoknadhjelpemidler'
export const HM_SOKNAD_API_PATH = API_PATH_BASE + '/api'
export const HM_ROLLER_PATH = API_PATH_BASE + '/innsender'

export interface RestService {
  hentSpraak: () => Promise<DkifResponse>
}

const fetchGet: (url: string) => Promise<Response> = (url) => {
  return fetchWithCredentials(url, { headers: { Pragma: 'no-cache' } })
}
const fetchPost: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (
  url,
  otherParams,
  timeout
) => {
  return fetchWithCredentials(url, { method: 'POST', ...otherParams }, timeout)
}
const fetchDelete: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (
  url,
  otherParams,
  timeout
) => {
  return fetchWithCredentials(url, { method: 'DELETE', ...otherParams }, timeout)
}
const fetchWithCredentials: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (
  url,
  otherParams,
  timeout
) => {
  return fetchWithTimeout(url, { credentials: 'same-origin', ...otherParams }, timeout)
}
const fetchWithTimeout = async (resource: RequestInfo, options: RequestInit = {}, timeout?: number) => {
  const controller = new AbortController()
  const id =
    timeout !== undefined
      ? setTimeout(() => {
          console.log(`warn: Request timed out after ${timeout}ms: ${resource}`)
          logAmplitudeEvent(digihot_customevents.FETCH_TIMEOUT, { resource: resource, timeout: timeout })
          controller.abort()
        }, timeout)
      : undefined
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  })
  if (id !== undefined) clearTimeout(id)
  return response
}

const handleResponse = async (response: Response) => {
  // TODO Håndtere innlogging her etterhvert?
  if (response.status >= 400 && response.status < 500) {
    // TODO find a better strategy to deal with unhandled promise exceptions than plastering try/catch all over
    const error = await response.json().catch((err: unknown) => console.log('ApiError thrown in handleResponse()', err))
    const message = error ? error.message : 'ApiError thrown in handleResponse()'
    throw new ApiError(message, response.status)
  }
  if (!response.ok) {
    throw new ApiError('Feil ved kontakt mot baksystem.', response.status)
  }
}

const hentSpraak = async () => {
  const response = await fetchGet(`${HM_SOKNAD_API_PATH}/dkif/spraak/`)
  await handleResponse(response)
  return await response.json()
}

export class FetcherError extends Error {
  constructor(public status: number, public json: string) {
    super(json)
    this.name = 'FetcherError'
    this.stack = (<any>new Error()).stack
    this.status = status
    this.json = json
  }
  toString() {
    return this.name + ': status=' + this.status + ' json=' + this.message
  }
}

export const fetcher = async (url: string) => {
  const response = await fetchGet(url)
  if (!response.ok) {
    let status = response.status
    let info = ''
    try {
      info = await response.json()
    } catch {}
    throw new FetcherError(status, JSON.stringify(info))
  }
  return await response.json()
}

export const postFetcher = (body?: any, timeout?: number) => async (url: string) => {
  const response = await fetchPost(
    url,
    {
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    timeout
  )
  if (!response.ok) {
    let status = response.status
    let info = ''
    try {
      info = await response.json()
    } catch {}
    throw new FetcherError(status, JSON.stringify(info))
  }
  return await response.json()
}

const logWarning = (errorCode: string) => {
  try {
    return fetchPost(`${BASE_PATH}/log/warning/${errorCode}`)
  } catch (err: unknown) {
    console.log('Logging av feil feilet...')
  }
}

const restService: RestService = {
  hentSpraak,
}

export default restService
