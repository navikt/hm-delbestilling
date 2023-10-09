import { useState } from 'react'

import rest, { API_PATH } from '../services/rest'
import { DelbestillerrolleResponse } from '../types/HttpTypes'

const useAuth = () => {
  const [sjekkerLogin, setSjekkerLogin] = useState(false)

  const sjekkLoginStatus = () => {
    try {
      setSjekkerLogin(true)
      return rest
        .sjekkLoginStatus()
        .then((result) => result)
        .finally(() => setSjekkerLogin(false))
    } catch (err) {
      console.log(`Kunne ikke sjekke loginstatus`, err)
      throw err
    }
  }

  const rolle = async (): Promise<DelbestillerrolleResponse> => {
    try {
      return await rest.hentRolle()
    } catch (err) {
      console.log(`Kunne ikke sjekke rolle`, err)
      throw err
    }
  }

  return {
    sjekkerLogin,
    sjekkLoginStatus,
    rolle,
  }
}

export default useAuth
