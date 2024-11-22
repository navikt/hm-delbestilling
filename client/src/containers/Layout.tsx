import React from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Alert, Heading, Link } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'

import { Avstand } from '../components/Avstand'
import rest from '../services/rest'
import Content from '../styledcomponents/Content'
import Header from '../styledcomponents/Header'
import { DelbestillerrolleResponse } from '../types/HttpTypes'
import { Rettighet, Tilgangsforespørselstatus } from '../types/Types'

// Delte page-komponenter for hver side
const Layout = () => {
  const { t } = useTranslation()
  const visTestMiljoBanner = window.appSettings.USE_MSW === true && window.location.hostname !== 'localhost'

  return (
    <>
      <Header>
        <Content>
          {visTestMiljoBanner && (
            <Avstand marginTop={4} marginBottom={8}>
              <Alert variant="info">{t('testbanner')}</Alert>
            </Avstand>
          )}
          <Heading level="1" size="xlarge">
            {t('felles.overskrift')}
          </Heading>
        </Content>
      </Header>
      <RettighetPåminnelse />
      <Outlet />
    </>
  )
}

const RettighetPåminnelse = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { data: delbestillerrolleData } = useQuery<DelbestillerrolleResponse>({
    queryKey: ['delbestillerrolle'],
    queryFn: () => rest.hentRolle(),
  })

  const { delbestillerrolle } = delbestillerrolleData ?? {}

  if (pathname === '/tilgang') {
    return null
  }

  if (!delbestillerrolle) {
    return null
  }

  const harDelbestillerrettighet = delbestillerrolle.delbestillerrettighet.harRettighet

  if (harDelbestillerrettighet) {
    return null
  }

  const harAktivForespørsel = delbestillerrolle.delbestillerrettighet.forespørsler.some(
    (f) => f.rettighet === Rettighet.DELBESTILLING && f.status === Tilgangsforespørselstatus.AVVENTER_BEHANDLING
  )

  if (harAktivForespørsel) {
    return (
      <Content>
        <Alert variant="info">
          Du har en aktiv forespørsel for å søke om deler.{' '}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault()
              navigate(`tilgang`)
            }}
          >
            Trykk her for å se den.
          </Link>
        </Alert>
      </Content>
    )
  }

  return (
    <Content>
      <Alert variant="warning">
        {' '}
        Det kan se ut som du ikke har fått den nye rettigheten for å bestille deler. Du kan fortsette bestille deler,
        men om x antall uker må du ha bedt om den nye rettigheten.{' '}
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate(`tilgang`)
          }}
        >
          Trykk her for å be om rettigheten nå.
        </Link>
      </Alert>
    </Content>
  )
}

export default Layout
