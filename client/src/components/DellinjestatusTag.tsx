import { useTranslation } from 'react-i18next'

import { Tag, TagProps } from '@navikt/ds-react'

import { formaterNorskDato } from '../helpers/utils'
import { Dellinje, Dellinjestatus } from '../types/Types'

interface Props {
  dellinje: Dellinje
}

function variantForDellinjestatus(dellinjestatus: Dellinjestatus | undefined): TagProps['variant'] {
  switch (dellinjestatus) {
    case Dellinjestatus.SKIPNINGSBEKREFTET:
      return 'success'
    default:
      return 'info'
  }
}

const DellinjestatusTag = ({ dellinje }: Props) => {
  const { t } = useTranslation()
  const variant = variantForDellinjestatus(dellinje.status)
  const statustekst =
    dellinje.status === Dellinjestatus.SKIPNINGSBEKREFTET
      ? t('bestillinger.dellinjestatus.SKIPNINGSBEKREFTET')
      : t('bestillinger.dellinjestatus.klarTilPlukk')

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Tag variant={variant}>{statustekst}</Tag>
      {dellinje.forventetLeveringsdato && (
        <>
          {t('bestillinger.dellinjestatus.forventetLeveringsdato', {
            dato: formaterNorskDato(dellinje.forventetLeveringsdato),
          })}
        </>
      )}
    </div>
  )
}

export default DellinjestatusTag
