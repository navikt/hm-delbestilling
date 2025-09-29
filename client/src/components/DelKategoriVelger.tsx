import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import { Chips, ReadMore } from '@navikt/ds-react'

import { Del } from '../types/Types'
import { logKategoriFiltreringGjort } from '../utils/amplitude'

import { Avstand } from './Avstand'

const ANTALL_SYNLIGE_KATEGORIER = 15

interface Props {
  delKategorier: string[]
  kategoriFilter?: string | undefined
  logKategoriValg?: boolean
  setKategoriFilter: Dispatch<SetStateAction<string | undefined>>
}

const DelKategoriVelger = ({ delKategorier, kategoriFilter, setKategoriFilter, logKategoriValg = true }: Props) => {
  const visCheckmark = delKategorier.length <= 2

  const synligeKategorier = delKategorier.slice(0, ANTALL_SYNLIGE_KATEGORIER)
  const restKategorier = delKategorier.slice(ANTALL_SYNLIGE_KATEGORIER)

  return (
    <>
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
        {synligeKategorier.map((kategori) => (
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
      <Avstand marginTop={4} marginBottom={6}>
        {restKategorier.length > 0 && (
          <ReadMore header="Vis alle">
            <Chips>
              {restKategorier.map((kategori) => (
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
          </ReadMore>
        )}
      </Avstand>
    </>
  )
}

export const useDelKategorier = (deler: Del[] | undefined) => {
  const [kategoriFilter, setKategoriFilter] = useState<string | undefined>()

  const delKategorier = useMemo(() => {
    if (!deler) {
      return []
    }

    return deler
      .reduce((acc, del) => {
        if (!acc.includes(del.kategori)) {
          acc.push(del.kategori)
        }
        return acc
      }, [] as string[])
      .sort()
  }, [deler])

  useEffect(() => setKategoriFilter(undefined), [deler])

  return { kategoriFilter, setKategoriFilter, delKategorier }
}

export default DelKategoriVelger
