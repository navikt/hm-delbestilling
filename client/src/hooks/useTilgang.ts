import { useState } from 'react'

import rest from '../services/rest'
import { TilgangsforespørselgrunnlagResponse } from '../types/HttpTypes'

const useTilgang = () => {
  const [henterTilgangsforespørselgrunnlag, setHenterTilgangsforespørselgrunnlag] = useState(false)

  const hentTilgangsforespørselgrunnlag = async (): Promise<TilgangsforespørselgrunnlagResponse> => {
    try {
      setHenterTilgangsforespørselgrunnlag(true)
      return await rest.hentForespørselgrunnlag()
    } catch (err) {
      console.log(`Kunne ikke hente forespørselgrunnlag`, err)
      throw err
    } finally {
      setHenterTilgangsforespørselgrunnlag(false)
    }
  }

  return {
    henterTilgangsforespørselgrunnlag,
    hentTilgangsforespørselgrunnlag,
  }
}

export default useTilgang
