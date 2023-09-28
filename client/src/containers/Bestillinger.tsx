import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import { Button, Heading } from '@navikt/ds-react'

import BestillingsListe from '../components/BestillingsListe'
import Rolleswitcher from '../components/Rolleswitcher'
import Content from '../styledcomponents/Content'

const BannerContainer = styled.header`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: flex-end;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1rem;
  padding-top: 1.5rem;
`

const Bestillinger = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <main>
      <Content>
        <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => navigate('/')}>
          Tilbake
        </Button>
        <BannerContainer>
          <Heading size="large">{t('bestillinger.dineSiste')}</Heading>
          <Button onClick={() => navigate('/')}>{t('oversikt.nyBestilling')}</Button>
        </BannerContainer>

        <BestillingsListe text={t('bestillinger.saker')} />
      </Content>
      {(window.appSettings.USE_MSW || window.appSettings.MILJO === 'dev-gcp') && <Rolleswitcher />}
    </main>
  )
}

export default Bestillinger
