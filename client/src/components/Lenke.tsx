import React, { useEffect } from 'react'

import { Link } from '@navikt/ds-react'

interface Props {
  href: string
  target?: string
  lenketekst: string
}

const Lenke = (props: Props) => {
  return (
    <Link href={props.href} target={props.target}>
      {props.lenketekst}
    </Link>
  )
}

export default Lenke
