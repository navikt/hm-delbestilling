import { BodyShort, Heading } from '@navikt/ds-react'
import React from 'react'
import styled from 'styled-components'

interface Props {
  navn: string
  hmsnr: string
  levArtNr: string | null
}

const SubtleBodyShort = styled(BodyShort)`
  color: var(--a-text-subtle);
`

const DelInfo = ({ navn, hmsnr, levArtNr }: Props) => {
  return (
    <>
      <div style={{ padding: 70, background: '#ececec' }}>[img]</div>
      <div>
        <Heading size="small" level="4" spacing>
          {navn}
        </Heading>

        <SubtleBodyShort>
          HMS-nr: {hmsnr} {levArtNr && <>| Lev.art.nr: {levArtNr}</>}
        </SubtleBodyShort>
      </div>
    </>
  )
}

export default DelInfo
