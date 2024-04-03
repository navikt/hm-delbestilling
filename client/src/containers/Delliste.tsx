import React, { useEffect, useState } from 'react'

import { Heading, Loader } from '@navikt/ds-react'

import rest from '../services/rest'
import { AlleDelerPerHjmTypeResponse } from '../types/HttpTypes'
import { Avstand } from '../components/Avstand'
import styled from 'styled-components'

const TH = styled.th`
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
`

const TD = styled.td`
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
`

const Delliste = () => {
  const [hjmDeler, setHjmDeler] = useState<AlleDelerPerHjmTypeResponse | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    rest
      .hentAlleDeler()
      .then((result) => setHjmDeler(result))
      .catch((error) => setError(true))
  }, [])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: 80 }}>
        <p>Det har skjedd en feil. Klarte ikke å hente ut oversikt over deler.</p>
      </div>
    )
  }

  if (!hjmDeler) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: 80 }}>
        <Loader size="3xlarge" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 20 }}>
      <Avstand margin={8}>
        <Avstand margin={12}>
          <Heading size="large">Alle deler som kan bestilles i løsningen</Heading>
        </Avstand>

        <table style={{ borderCollapse: 'collapse' }}>
          <tr>
            <TH>Art.nr.</TH>
            <TH>Navn</TH>
            <TH>Hjelpemiddel</TH>
          </tr>
          {Object.entries(hjmDeler).map(([hjmtype, deler]) =>
            deler.map((del, index) => (
              <tr key={index}>
                <TD>{del.hmsnr}</TD>
                <TD>{del.navn}</TD>
                <TD>{hjmtype}</TD>
              </tr>
            ))
          )}
        </table>
      </Avstand>
    </div>
  )
}

export default Delliste
