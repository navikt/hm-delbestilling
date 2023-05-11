const useAuth = () => {
  const loginStatus = async () => {
    try {
      const result = await fetch('/hjelpemidler/delbestilling/session')

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

  return {
    loginStatus,
  }
}

export default useAuth
