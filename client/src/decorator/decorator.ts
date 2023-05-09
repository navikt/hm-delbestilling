import { onLanguageSelect, setParams } from '@navikt/nav-dekoratoren-moduler'
import * as Sentry from '@sentry/browser'
import i18next from 'i18next'
import Cookies from 'universal-cookie'
import { BASE_PATH } from '../App'
import restService from '../services/rest-service'
import { digihot_customevents, logCustomEvent } from '../utils/amplitude'

interface Params {
  context?: 'privatperson' | 'arbeidsgiver' | 'samarbeidspartner'
  simple?: boolean
  enforceLogin?: boolean
  redirectToApp?: boolean
  level?: string
  language?: 'nb' | 'nn' | 'en' | 'se'
  feedback?: boolean
  chatbot?: boolean
}

const DECORATOR_LANGUAGE_COOKIE = 'decorator-language'
const DEFAULT_PARAMS: Params = {
  chatbot: false,
  simple: true,
  feedback: false,
  context: 'samarbeidspartner',
}
const SPRAAK = ['nb', 'nn']

export const initDecorator = () => {
  const cookies = new Cookies()
  const language = cookies.get(DECORATOR_LANGUAGE_COOKIE)

  if (language === undefined || !SPRAAK.includes(language)) {
    restService
      .hentSpraak()
      .then((response) => {
        setLanguage(response.spraak)
        changeLanguage(response.spraak)
      })
      .catch((error) => {
        console.log('Henting av språk feilet', error)
        Sentry.captureException(error)
      })
  } else {
    console.log('hentet språk fra cookies: ' + language)
    changeLanguage(language)
  }

  setParams({
    ...DEFAULT_PARAMS,
    availableLanguages: [
      { locale: 'nb', url: BASE_PATH, handleInApp: true },
      { locale: 'nn', url: BASE_PATH, handleInApp: true },
    ],
  })

  onLanguageSelect((language) => {
    changeLanguage(language.locale)
  })
}

const changeLanguage = (language: string) => {
  i18next.changeLanguage(language)
  logCustomEvent(digihot_customevents.SPRAAK_ENDRET, { språk: language })
}

export const setLanguage = (language: 'nb' | 'nn' | 'en' | 'se') => {
  setParams({
    ...DEFAULT_PARAMS,
    language: language,
  })
}
