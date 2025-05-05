import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import { Button, Heading } from '@navikt/ds-react'

import BestillingsListe from '../components/BestillingsListe'
import Content from '../styledcomponents/Content'

const BannerContainer = styled.div`
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
          <Heading size="large" level="2">
            {t('bestillinger.dineSiste')}
          </Heading>
          <Button onClick={() => navigate('/')}>{t('oversikt.nyBestilling')}</Button>
        </BannerContainer>

        <BestillingsListe text={t('bestillinger.saker')} />
      </Content>
    </main>
  )
}

export default Bestillinger
