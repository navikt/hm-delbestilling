import rest, { API_PATH } from '../services/rest'
import { DelbestillerrolleResponse } from '../types/HttpTypes'

const useAuth = () => {
  const loginStatus = async () => {
    try {
      return rest.sjekkLoginStatus()
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
    loginStatus,
    rolle,
  }
}

export default useAuth
