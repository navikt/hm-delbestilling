import { useState } from 'react'

import rest from '../services/rest'

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

  return {
    sjekkerLogin,
    sjekkLoginStatus,
  }
}

export default useAuth
