import { useTranslation } from 'react-i18next'

import { BodyLong, HStack, InfoCard, Radio, RadioGroup } from '@navikt/ds-react'

import { Avstand } from './Avstand'

export interface TilbehorInfo {
  harTilbehørFraFør: boolean | undefined
}

interface Props {
  delId: string
  tilbehorInfo: Record<string, TilbehorInfo>
  setTilbehorInfo: React.Dispatch<React.SetStateAction<Record<string, TilbehorInfo>>>
}

const TilbehørSpørsmål = ({ delId, tilbehorInfo, setTilbehorInfo }: Props) => {
  const { t } = useTranslation()
  const currentInfo = tilbehorInfo[delId]

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
    >
      <HStack gap="space-0 space-24">
        <Radio value={true}>{t('felles.ja')}</Radio>
        <Radio value={false}>{t('felles.nei')}</Radio>
      </HStack>
      {currentInfo?.harTilbehørFraFør === false && (
        <Avstand marginTop={2}>
          <InfoCard data-color="info">
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
