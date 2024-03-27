import React, { useEffect } from 'react'

import { Link } from '@navikt/ds-react'
import { logNavigeringLenke } from '../utils/amplitude'

interface Props {
  href: string
  target?: string
  lenketekst: string
}

/**
 * Wrapper for @navikt/ds-react/Link fordi i18n <Trans components:{...} /> ikke funker med <Link />
 * fordi det er et reservert ord.
 */
export const Lenke = (props: Props) => {
  return (
    <Link href={props.href} target={props.target}>
      {props.lenketekst}
    </Link>
  )
}

export const LenkeMedLogging = (props: Props) => {
  return (
    <Link href={props.href} target={props.target} onClick={() => logNavigeringLenke(props.href)}>
      {props.lenketekst}
    </Link>
  )
}
