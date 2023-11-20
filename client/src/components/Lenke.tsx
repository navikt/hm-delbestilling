import React, { useEffect } from 'react'

import { Link } from '@navikt/ds-react'

interface Props {
  href: string
  target?: string
  lenketekst: string
}

/**
 * Wrapper for @navikt/ds-react/Link fordi i18n <Trans components:{...} /> ikke funker med <Link />
 * fordi det er et reservert ord.
 */
const Lenke = (props: Props) => {
  return (
    <Link href={props.href} target={props.target}>
      {props.lenketekst}
    </Link>
  )
}

export default Lenke
