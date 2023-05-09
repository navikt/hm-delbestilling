import helmet from 'helmet'

const ALLOWED_DOMAINS = ['*.nav.no', '*.adeo.no', '*.hjelpemiddeldatabasen.no', '*.nav.boost.ai']
const GOOGLE_TAG_MANAGER_DOMAIN = '*.googletagmanager.com'
const ACCOUNT_PSPLUGIN_DOMAIN = 'account.psplugin.com'
const NAV_PSPLUGIN_DOMAIN = 'nav.psplugin.com'
const HOTJAR_DOMAINS = ['*.hotjar.com', '*.hotjar.io']
const VARS_HOTJAR_DOMAIN = 'vars.hotjar.com'
const TASKANALYTICS_DOMAINS = ['*.taskanalytics.com', 'ta-survey-v2.herokuapp.com']
const SENTRY_DOMAINS = ['sentry.gc.nav.no', '*.sentry.io', 'browser.sentry-cdn.com', 'js.sentry-cdn.com']

/**
 * Det hadde vært best å fjerne 'unsafe-inline' fra scriptSrc, men NAV dekoratøren kjører inline scripts som ikke vil fungere uten dette.
 * Denne reglen vil også treffe applikasjoner som bruker create-react-app siden den lager et inline script for å bootstrape appen.
 * Dette kan fikses med å sette "INLINE_RUNTIME_CHUNK=false" i en .env fil.
 *
 * unsafe-eval i scriptSrc blir brukt av account.psplugin.com. Hvis vi ikke trenger psplugin så bør dette fjernes.
 */

export function helmetConfig() {
  return helmet.contentSecurityPolicy({
    reportOnly: true,
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"].concat(
        ALLOWED_DOMAINS,
        GOOGLE_TAG_MANAGER_DOMAIN,
        NAV_PSPLUGIN_DOMAIN,
        HOTJAR_DOMAINS,
        SENTRY_DOMAINS,
        TASKANALYTICS_DOMAINS
      ),
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", 'https:', 'data:'].concat(ALLOWED_DOMAINS),
      frameAncestors: ["'self'"],
      frameSrc: [VARS_HOTJAR_DOMAIN],
      objectSrc: ["'self'"].concat(ALLOWED_DOMAINS),
      manifestSrc: ["'self'"].concat(ALLOWED_DOMAINS),
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"].concat(
        // TODO unsafe-inline and unsafe-eval bad
        ALLOWED_DOMAINS,
        GOOGLE_TAG_MANAGER_DOMAIN,
        ACCOUNT_PSPLUGIN_DOMAIN,
        HOTJAR_DOMAINS,
        TASKANALYTICS_DOMAINS,
        SENTRY_DOMAINS
      ),
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'].concat(
        ALLOWED_DOMAINS,
        TASKANALYTICS_DOMAINS,
        ACCOUNT_PSPLUGIN_DOMAIN
      ), // TODO: unsafe-inline bad
      imgSrc: ["'self'", 'data:'].concat(
        ALLOWED_DOMAINS,
        GOOGLE_TAG_MANAGER_DOMAIN,
        HOTJAR_DOMAINS
      ), // analytics sends information by loading images with query params
      workerSrc: ["'self'", 'blob:'].concat(ALLOWED_DOMAINS), // TODO: blob bad?
      childSrc: ["'self'", 'blob:'].concat(ALLOWED_DOMAINS), // TODO: blob bad?
      upgradeInsecureRequests: [],
      reportUri: ['https://sentry.gc.nav.no/api/121/security/?sentry_key=337808aa68ac406f9388996208196f97'],
    },
  })
}
