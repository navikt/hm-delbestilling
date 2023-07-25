import { Button, GuidePanel, Heading, ReadMore } from '@navikt/ds-react'
import React, { useState } from 'react'
import Content from '../styledcomponents/Content'
import BestillingsListe from '../components/BestillingsListe'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Avstand } from '../components/Avstand'

const BannerContainer = styled.header`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: flex-end;
  margin-left: auto;
  margin-right: auto;
  padding-top: 1.5rem;
`

const Bestillinger = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <main>
      <Content>
        <BannerContainer>
          <Heading size="xlarge">{t('bestillinger.dine')}</Heading>
          <Button onClick={() => navigate('/')}>Ny bestilling</Button>
        </BannerContainer>
        <GuidePanel poster>
          {t('bestillinger.guide.tekst')}
          <ReadMore
            style={{ marginTop: '2rem' }}
            header={
              isOpen ? t('bestillinger.guide.statuser.lukk') : t('bestillinger.guide.statuser.apne')
            }
            onClick={() => setIsOpen(!isOpen)}
          >
            <Heading size="medium" level="2">
              {t('bestillinger.guide.statuser.beskrivelse')}
            </Heading>
          </ReadMore>
        </GuidePanel>
        <Avstand marginTop={12} />
        <BestillingsListe text={t('bestillinger.saker')} />
      </Content>
    </main>
  )
}

export default Bestillinger
