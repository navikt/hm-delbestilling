import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import { PrinterSmallIcon } from '@navikt/aksel-icons'
import { Alert, BodyShort, Box, Button, Detail, Heading, HStack } from '@navikt/ds-react'

import { formaterNorskDato } from '../helpers/utils'
import { DelbestillingSak, Levering, Ordrestatus } from '../types/Types'
import { logPrintAvBestillingÅpnet } from '../utils/amplitude'

import { Avstand } from './Avstand'
import DellinjestatusTag from './DellinjestatusTag'
import OrdrestatusTag from './OrdrestatusTag'

import styles from './BestillingsKort.module.css'

interface Props {
  sak: DelbestillingSak
}

const BestillingsKort = ({ sak }: Props) => {
  const { t } = useTranslation()

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => {
      logPrintAvBestillingÅpnet(window.location.pathname)
    },
    documentTitle: `kvittering_delbestilling_${sak.saksnummer}`,
  })

  const visOrdrestatusTag =
    sak.status !== Ordrestatus.DELVIS_SKIPNINGSBEKREFTET && sak.status !== Ordrestatus.SKIPNINGSBEKREFTET

  return (
    <Avstand marginBottom={4}>
      <Box
        padding="4"
        background="bg-default"
        borderColor="border-default"
        borderWidth="1"
        style={{ position: 'relative' }}
        ref={printRef}
      >
        <Heading size="small" level="3">
          {sak.delbestilling.navn ? <>Bestilling til {sak.delbestilling.navn}</> : <>Bestilling</>}
        </Heading>
        <Detail style={{ display: 'flex', gap: '1rem' }}>
          <span>Art.nr. {sak.delbestilling.hmsnr}</span>
          <span>Serienr. {sak.delbestilling.serienr}</span>
        </Detail>
        <Avstand marginBottom={4} />
        {sak.delbestilling.deler.map((dellinje, index) => (
          <div key={index} className={styles.dellinje}>
            <HStack justify="space-between">
              <BodyShort size="medium" style={{ marginBottom: '0' }}>
                {dellinje.del.navn}
              </BodyShort>
              <BodyShort size="medium">{dellinje.antall} stk</BodyShort>
            </HStack>
            <BodyShort size="medium" textColor="subtle">
              HMS-nr. {dellinje.del.hmsnr}
            </BodyShort>
            <div className={styles.skjulForPrint}>
              {dellinje.lagerstatusPåBestillingstidspunkt &&
                dellinje.antall > dellinje.lagerstatusPåBestillingstidspunkt.antallDelerPåLager && (
                  <Alert variant="info" inline>
                    {t('bestillinger.del.ikkePåLager')}
                  </Alert>
                )}
            </div>
            <div className={styles.skjulForPrint}>
              {!visOrdrestatusTag && <DellinjestatusTag dellinje={dellinje} />}
            </div>
          </div>
        ))}
        <Avstand marginBottom={4} />

        <BodyShort size="small" spacing>
          <strong>
            {sak.delbestilling.levering === Levering.TIL_XK_LAGER
              ? t('bestillinger.tilXKLager')
              : t('bestillinger.serviceOppdrag')}
          </strong>
        </BodyShort>

        <BodyShort size="small" spacing>
          {t('bestillinger.kort.innsendt')} {formaterNorskDato(sak.opprettet)}
        </BodyShort>

        <BodyShort size="small" spacing>
          {t('felles.saksnummer')}: {sak.saksnummer}
        </BodyShort>

        <div className={styles.skjulForPrint}>
          {visOrdrestatusTag && <OrdrestatusTag sak={sak} />}
          <div style={{ position: 'absolute', right: 10, bottom: 10 }}>
            <Button variant="tertiary" onClick={handlePrint} icon={<PrinterSmallIcon />}>
              {t('felles.skrivUt')}
            </Button>
          </div>
        </div>
      </Box>
    </Avstand>
  )
}

export default BestillingsKort
