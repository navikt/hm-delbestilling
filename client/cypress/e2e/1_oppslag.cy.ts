/// <reference types="cypress" />

// If one test fails, just quit. No point continuing the happy path.
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    ;(Cypress as any).runner.stop() // TODO: fix type
  }
})

describe('test av oppslag', () => {
  before(() => {
    cy.visit('/')
  })
  beforeEach(() => {
    cy.window().its('msw').should('exist')
  })

  afterEach(() => {
    cy.get('[data-cy="button-oppslag-reset"]').click()
  })

  it('skal vise riktig feilmelding hvis kall mot backend feiler', () => {
    cy.window().then((window) => {
      const { worker, rest } = window.msw
      worker.use(
        rest.post('/hjelpemidler/delbestilling/api/oppslag', (req, res, ctx) => {
          return res.once(ctx.status(500))
        })
      )
    })

    cy.get('[data-cy="input-artnr"]').type('123123')
    cy.get('[data-cy="input-serienr"]').type('123123')
    cy.get('[data-cy="button-oppslag-submit"]').click()

    cy.get('[data-cy="feilmelding').should('contain', 'Noe gikk feil med oppslag, prøv igjen senere')
  })

  it('skal vise riktig feilmelding hvis det ikker noe utlån', () => {
    cy.get('[data-cy="input-artnr"]').type('333333')
    cy.get('[data-cy="input-serienr"]').type('123123')
    cy.get('[data-cy="button-oppslag-submit"]').click()

    cy.get('[data-cy="feilmelding').should('contain', 'Vi finner dessverre ikke et utlån på dette art.nr og serienr.')
  })

  it('skal vise riktig feilmelding hvis løsningen ikke støtter det hjelpemiddelet nå', () => {
    cy.get('[data-cy="input-artnr"]').type('000000')
    cy.get('[data-cy="input-serienr"]').type('123123')
    cy.get('[data-cy="button-oppslag-submit"]').click()

    cy.get('[data-cy="feilmelding').should(
      'contain',
      'Du kan ikke bestille del til dette hjelpemidlet da det ikke er registrert hos oss. Ta kontakt med din hjelpemiddelsentral for hjelp.'
    )
  })
})
