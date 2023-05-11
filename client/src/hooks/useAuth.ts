import { DelbestillerResponse } from '../types/ResponseTypes'

const useAuth = () => {
  const loginStatus = async () => {
    try {
      const result = await fetch('/hjelpemidler/delbestilling/auth/status')

      if (result.status === 401) {
        return false
      }

      if (!result.ok) {
        throw Error(result.statusText)
      }

      return true
    } catch (err) {
      console.log(`Kunne ikke sjekke loginstatus`, err)
      throw err
    }
  }

  const rolle = async (): Promise<DelbestillerResponse> => {
    try {
      const result = await fetch('/hjelpemidler/delbestilling/roller/delbestiller')

      if (!result.ok) {
        throw Error(result.statusText)
      }

      return await result.json()
    } catch (err) {
      console.log(`Kunne ikke sjekke loginstatus`, err)
      throw err
    }
  }

  return {
    loginStatus,
    rolle,
  }
}

export default useAuth
