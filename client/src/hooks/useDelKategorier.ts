import { useEffect, useMemo, useState } from 'react'

import { Del } from '../types/Types'

const useDelKategorier = (deler: Del[] | undefined) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()
  const delKategorier = useMemo(() => {
    if (deler) {
      return deler.reduce((acc, del) => {
        const førsteOrd = del.navn.split(' ')[0]
        if (!acc.includes(førsteOrd)) {
          acc.push(førsteOrd)
        }
        return acc
      }, [] as string[])
    }
  }, [deler])?.sort()
  useEffect(() => setKategoriFilter(undefined), [deler])
  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default useDelKategorier
