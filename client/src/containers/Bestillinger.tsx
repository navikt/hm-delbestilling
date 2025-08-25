import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ArrowLeftIcon } from '@navikt/aksel-icons'
import { Button, Heading } from '@navikt/ds-react'

import BestillingsListe from '../components/BestillingsListe/BestillingsListe'
import Content from '../components/Layout/Content'

import styles from '../styles/Containers.module.css'

const Bestillinger = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <main>
      <Content>
        <Button icon={<ArrowLeftIcon />} variant="tertiary" onClick={() => navigate('/')}>
          Tilbake
        </Button>
        <div className={styles.bannerContainer}>
          <Heading size="large" level="2">
            {t('bestillinger.dineSiste')}
          </Heading>
          <Button onClick={() => navigate('/')}>{t('oversikt.nyBestilling')}</Button>
        </div>

        <BestillingsListe text={t('bestillinger.saker')} />
      </Content>
    </main>
  )
}

export default Bestillinger
