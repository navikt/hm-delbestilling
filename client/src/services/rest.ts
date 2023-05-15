import { DelbestillerResponse, OppslagResponse } from '../types/ResponseTypes'
import { InnsendtBestilling } from '../types/Types'

export const REST_BASE_PATH = '/hjelpemidler/delbestilling'
export const API_PATH = REST_BASE_PATH + '/api'
export const ROLLER_PATH = REST_BASE_PATH + '/roller'

const fetchPost: (url: string, otherParams?: any, timeout?: number) => Promise<Response> = (url, otherParams) => {
  return fetch(url, { method: 'POST', ...otherParams })
}

const hjelpemiddelOppslag = async (artNr: string, serieNr: string): Promise<OppslagResponse> => {
  const response = await fetchPost(API_PATH + '/oppslag', {
    body: JSON.stringify({ artNr, serieNr }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}

const hentBestillingerForBruker = async (): Promise<InnsendtBestilling[]> => {
  const response = await fetch(API_PATH + '/delbestilling')
  return await response.json()
}

const sendInnBestilling = async (bestilling: InnsendtBestilling): Promise<string> => {
  const response = await fetchPost(`${API_PATH}/delbestilling`, {
    body: JSON.stringify(bestilling),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const id = await response.text()
  return id
}

const hentRolle = async (): Promise<DelbestillerResponse> => {
  const response = await fetch(`${ROLLER_PATH}/delbestiller`)
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
  hentRolle,
  sjekkLoginStatus,
}
