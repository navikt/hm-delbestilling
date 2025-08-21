import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button, Loader } from '@navikt/ds-react'

import useAuth from '../../hooks/useAuth'
import rest from '../../services/rest'
import { DelbestillingSak, Valg } from '../../types/Types'
import { Avstand } from '../Avstand'
import BestillingsKort from '../BestillingsKort/BestillingsKort'

import styles from './BestillingsListe.module.css'

interface Props {
  text: string
  maksBestillinger?: number
}

const BestillingsListe = ({ text, maksBestillinger }: Props) => {
  const { t } = useTranslation()
  const [tidligereBestillingerForValg, setTidligereBestillingerForValg] = useState<
    Record<Valg, DelbestillingSak[] | undefined>
  >({
    mine: undefined,
    kommunens: undefined,
  })
  const [henterTidligereBestillinger, setHenterTidligereBestillinger] = useState(true)
  const [valg, setValg] = useState<Valg>('mine')
  const navigate = useNavigate()
  const { sjekkLoginStatus } = useAuth()

  useEffect(() => {
    hentBestillinger(valg)
  }, [valg])

  const hentBestillinger = async (valg: Valg) => {
    console.log(`Henter bestillinger for ${valg}`)

    try {
      const erLoggetInn = await sjekkLoginStatus()
      if (erLoggetInn) {
        setHenterTidligereBestillinger(true)
        let bestillinger = await rest.hentBestillinger(valg)
        setTidligereBestillingerForValg({
          ...tidligereBestillingerForValg,
          [valg]: bestillinger,
        })
      }
    } catch (err) {
      console.log(`Klarte ikke hente tidliger bestillinger`, err)
      setTidligereBestillingerForValg({
        ...tidligereBestillingerForValg,
        [valg]: undefined,
      })
    } finally {
      setHenterTidligereBestillinger(false)
    }
  }

  const tidligereBestillinger = useMemo(() => {
    let bestillinger = tidligereBestillingerForValg[valg]
    if (bestillinger) {
      bestillinger = bestillinger.sort((a, b) => b.saksnummer - a.saksnummer)
      // return maksBestillinger ? bestillinger.slice(0, maksBestillinger) : bestillinger
      return bestillinger
    }
    return undefined
  }, [tidligereBestillingerForValg, valg, maksBestillinger])

  const handleGåTilBestillinger = async () => {
    try {
      const erLoggetInn = await sjekkLoginStatus()
      if (erLoggetInn) {
        navigate('/bestillinger')
      } else {
        window.location.replace('/hjelpemidler/delbestilling/login?redirect=bestillinger')
      }
    } catch (e: any) {
      console.error(e)
      // TODO: vis feilmelding
      alert(t('error.klarteIkkeViseBestillinger'))
    }
  }

  return (
    <>
      {/* <SakerBanner>
        {henterTidligereBestillinger && tidligereBestillinger && <Loader size="small" />}
        <ToggleGroup defaultValue="mine" size="small" onChange={(val) => setValg(val as Valg)}>
          <ToggleGroup.Item value="mine">Mine</ToggleGroup.Item>
          <ToggleGroup.Item value="kommunens">Kommunens</ToggleGroup.Item>
        </ToggleGroup>
      </SakerBanner> */}

      {tidligereBestillinger && tidligereBestillinger.length > 0 ? (
        <>
          {tidligereBestillinger.map((sak) => (
            <BestillingsKort key={sak.delbestilling.id} sak={sak} />
          ))}
        </>
      ) : henterTidligereBestillinger ? (
        <div className={styles.loaderContainer}>
          <Loader size="2xlarge" />
        </div>
      ) : (
        <div>{t('bestillinger.ingenBestillinger')}</div>
      )}

      {tidligereBestillinger && tidligereBestillinger.length > 0 && maksBestillinger && (
        <div className={styles.buttonContainer} style={{ marginTop: 'var(--a-spacing-4)' }}>
          <Button onClick={handleGåTilBestillinger}>{t('bestillinger.visAlle')}</Button>
        </div>
      )}
    </>
  )
}

export default BestillingsListe
