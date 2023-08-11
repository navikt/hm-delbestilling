import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import linker from './assets/locales/linker.json'
import nbTranslation from './assets/locales/nb/translation.json'
import nnTranslation from './assets/locales/nn/translation.json'

const resources = {
  nb: {
    translation: nbTranslation,
  },
  nn: {
    translation: nnTranslation,
  },
  common: {
    translation: linker,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'nb',
  fallbackLng: 'common',
  keySeparator: false,
  nsSeparator: false,
  debug: false,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

export default i18n
