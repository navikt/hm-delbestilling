import { Chips } from '@navikt/ds-react'
import { logKategoriFiltreringGjort } from '../utils/amplitude'
import React, { Dispatch, SetStateAction } from 'react'

interface Props {
  delKategorier?: string[]
  kategoriFilter?: string
  setKategoriFilter: Dispatch<SetStateAction<string | undefined>>
}

const DelKategoriVelger = (props: Props) => {
  const { delKategorier, kategoriFilter, setKategoriFilter } = props
  if (delKategorier) {
    return (
      <Chips>
        <Chips.Toggle
          key="alle-deler"
          selected={kategoriFilter === undefined}
          onClick={() => {
            logKategoriFiltreringGjort('alle deler')
            setKategoriFilter(undefined)
          }}
        >
          Alle deler
        </Chips.Toggle>
        {delKategorier.map((kategori) => (
          <Chips.Toggle
            key={kategori}
            selected={kategoriFilter === kategori}
            onClick={() => {
              logKategoriFiltreringGjort(kategori)
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
