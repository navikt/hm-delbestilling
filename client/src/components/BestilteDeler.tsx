import React, { useEffect, useState } from 'react'
import { Button } from '@navikt/ds-react'
import rest from '../services/rest'

interface Props {
  artnr: string
  serienr: string
}

export const BestilteDeler = ({ artnr, serienr }: Props) => {
  const [visBestilteDeler, setVisBestilteDeler] = useState(false)

  useEffect(() => {
    if (visBestilteDeler) {
      const response = rest.hentTidligereBestilteDeler(artnr, serienr)
    }
  }, [visBestilteDeler])

  if (!visBestilteDeler) {
    return <Button onClick={() => setVisBestilteDeler(true)}>Vis tidligere bestilte deler</Button>
  } else {
    return <div>bestilt</div>
  }
}
