import { isConsentingToSurveys } from './nav-cookie-consent'

export const triggerHotjarEvent = (event: string) => {
  if (!isConsentingToSurveys()) {
    console.log('Har ikke godtatt surveys-cookie, returnerer...')
    return
  }
  window.hj =
    window.hj ||
    function () {
      ;(window.hj.q = window.hj.q || []).push(arguments)
    }
  console.log('trigger hotjar event', event)
  window.hj('event', event)
}
