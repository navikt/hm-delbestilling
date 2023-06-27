import { useEffect, useState } from 'react'

const useSkjermbredde = () => {
  const [bredde, setBredde] = useState(window.innerWidth)

  useEffect(() => {
    const størrelseLytter = () => setBredde(window.innerWidth)
    window.addEventListener('resize', størrelseLytter)
    return () => window.removeEventListener('resize', størrelseLytter)
  }, [])

  return { bredde }
}

export default useSkjermbredde
