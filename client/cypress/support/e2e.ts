Cypress.on('uncaught:exception', (err, runnable) => {
  // https://docs.cypress.io/api/events/catalog-of-events#To-conditionally-turn-off-uncaught-exception-handling-for-a-certain-error
  // Ikke feil tester hvis det skulle uhåndterte exceptions
  // Å returnere false forhindrer Cypress i å feile testen

  // Ignorer CORS-feil
  if (err.message.includes('uncaught error was thrown from a cross origin script')) {
    console.log('IGNORED cross origin error:', err)
    return false
  }

  return true
})
