import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { BodyLong, HStack, InfoCard, Radio, RadioGroup } from '@navikt/ds-react'

import { Avstand } from './Avstand'

export interface TilbehorInfo {
  harTilbehørFraFør: boolean | undefined
}

export interface TilbehorErrors {
  harTilbehørFraFør: string | undefined
}

interface Props {
  delId: string
  errors: Record<string, TilbehorErrors>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, TilbehorErrors>>>
  submitAttempt: boolean
  tilbehorInfo: Record<string, TilbehorInfo>
  setTilbehorInfo: React.Dispatch<React.SetStateAction<Record<string, TilbehorInfo>>>
}

const TilbehørSpørsmål = ({ delId, errors, setErrors, submitAttempt, tilbehorInfo, setTilbehorInfo }: Props) => {
  const { t } = useTranslation()
  const currentInfo = tilbehorInfo[delId]
  const currentErrors = errors[delId] || { harTilbehørFraFør: undefined }

  useEffect(() => {
    const newErrors: TilbehorErrors = {
      harTilbehørFraFør: undefined,
    }

    if (currentInfo?.harTilbehørFraFør === undefined) {
      newErrors.harTilbehørFraFør = t('tilbehor.feil.maSvareFinnesTilbehor')
    }

    setErrors((prev) => ({
      ...prev,
      [delId]: newErrors,
    }))
  }, [currentInfo, setErrors, delId])

  return (
    <RadioGroup
      legend={t('tilbehor.sporsmal.finnesTilbehorFraFor')}
      value={currentInfo?.harTilbehørFraFør ?? ''}
      onChange={(value) => {
        setTilbehorInfo((prev) => ({
          ...prev,
          [delId]: {
            ...prev[delId],
            harTilbehørFraFør: value,
          },
        }))
      }}
      error={submitAttempt && currentErrors.harTilbehørFraFør}
    >
      <HStack gap="space-0 space-24">
        <Radio value={true}>{t('felles.ja')}</Radio>
        <Radio value={false}>{t('felles.nei')}</Radio>
      </HStack>
      {currentInfo?.harTilbehørFraFør === false && (
        <Avstand marginTop={2}>
          <InfoCard data-color="warning">
            <InfoCard.Header>
              <InfoCard.Title>{t('tilbehor.kanIkkeBestilles.tittel')}</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <BodyLong>{t('tilbehor.kanIkkeBestilles.beskrivelse')}</BodyLong>
            </InfoCard.Content>
          </InfoCard>
        </Avstand>
      )}
    </RadioGroup>
  )
}

export default TilbehørSpørsmål
