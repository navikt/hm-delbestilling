import { useState } from 'react'

import rest from '../services/rest'
import { TilgangsforespørselgrunnlagResponse } from '../types/HttpTypes'
import { Tilgangsforespørsel } from '../types/Types'

const useTilgang = () => {
  const [henterTilgangsforespørselgrunnlag, setHenterTilgangsforespørselgrunnlag] = useState(false)
  const [senderTilgangsforespørsel, setSenderTilgangsforespørsel] = useState(false)

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

  const sendTilgangsforespørsel = async (tilgangsforespørsel: Tilgangsforespørsel): Promise<string> => {
    try {
      setSenderTilgangsforespørsel(true)
      return await rest.sendTilgangsforespørsel(tilgangsforespørsel)
    } catch (err) {
      console.log(`Kunne ikke sende tilgangsforespørsel`, err)
      throw err
    } finally {
      setSenderTilgangsforespørsel(false)
    }
  }

  return {
    henterTilgangsforespørselgrunnlag,
    hentTilgangsforespørselgrunnlag,
    senderTilgangsforespørsel,
    sendTilgangsforespørsel,
  }
}

export default useTilgang
