import React from 'react'
import { useTranslation } from 'react-i18next'

import { Tag, TagProps } from '@navikt/ds-react'

import { DelbestillingSak, Ordrestatus } from '../types/Types'

interface Props {
  sak: DelbestillingSak
}

function variantForOrdestatus(ordrestatus: Ordrestatus): TagProps['variant'] {
  switch (ordrestatus) {
    case Ordrestatus.INNSENDT:
    case Ordrestatus.KLARGJORT:
    case Ordrestatus.REGISTRERT:
      return 'info'
    case Ordrestatus.LUKKET:
      return 'neutral'
    default:
      return 'neutral'
  }
}

const OrdrestatusTag = ({ sak }: Props) => {
  const { t } = useTranslation()
  const variant = variantForOrdestatus(sak.status)

  return <Tag variant={variant}>{t(`bestillinger.ordrestatus.${sak.status}`)}</Tag>
}

export default OrdrestatusTag
