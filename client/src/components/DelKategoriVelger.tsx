import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { Chips } from '@navikt/ds-react'

import { Del } from '../types/Types'
import { logKategoriFiltreringGjort } from '../utils/analytics/analytics'

interface Props {
  delKategorier: string[]
  kategoriFilter?: string | undefined
  logKategoriValg?: boolean
  setKategoriFilter: Dispatch<SetStateAction<string | undefined>>
}

const DelKategoriVelger = ({ delKategorier, kategoriFilter, setKategoriFilter, logKategoriValg = true }: Props) => {
  const visCheckmark = delKategorier.length <= 2

  return (
    <Chips>
      <Chips.Toggle
        checkmark={visCheckmark}
        key="alle-deler"
        selected={kategoriFilter === undefined}
        onClick={() => {
          if (logKategoriValg) {
            logKategoriFiltreringGjort('alle deler')
          }
          setKategoriFilter(undefined)
        }}
      >
        Alle deler
      </Chips.Toggle>
      {delKategorier.map((kategori) => (
        <Chips.Toggle
          checkmark={visCheckmark}
          key={kategori}
          selected={kategoriFilter === kategori}
          onClick={() => {
            if (logKategoriValg) {
              logKategoriFiltreringGjort(kategori)
            }
            setKategoriFilter(kategori)
          }}
        >
          {kategori}
        </Chips.Toggle>
      ))}
    </Chips>
  )
}

export const useDelKategorier = (deler: Del[] | undefined) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()

  const delKategorier = useMemo(() => {
    if (!deler) {
      return []
    }

    return deler.reduce((acc, del) => {
      if (!acc.includes(del.kategori)) {
        acc.push(del.kategori)
      }
      return acc
    }, [] as string[])
  }, [deler]).sort()

  useEffect(() => setKategoriFilter(undefined), [deler])

  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default DelKategoriVelger
