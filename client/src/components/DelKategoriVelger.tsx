import React, { Dispatch, SetStateAction } from 'react'

import { Chips } from '@navikt/ds-react'

import { logKategoriFiltreringGjort } from '../utils/amplitude'

interface Props {
  delKategorier: string[] | undefined
  kategoriFilter?: string | undefined
  logKategoriValg?: boolean
  setKategoriFilter: Dispatch<SetStateAction<string | undefined>>
}

const DelKategoriVelger = ({ delKategorier, kategoriFilter, setKategoriFilter, logKategoriValg = true }: Props) => {
  if (delKategorier) {
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
  return <></>
}

export default DelKategoriVelger
