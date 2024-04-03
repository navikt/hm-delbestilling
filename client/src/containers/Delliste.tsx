import React, { useEffect, useState } from 'react'

import { Heading, Loader, Table } from '@navikt/ds-react'

import rest from '../services/rest'
import { AlleDelerPerHjmTypeResponse } from '../types/HttpTypes'
import { Avstand } from '../components/Avstand'

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

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Art.nr.</Table.HeaderCell>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Hjelpemiddel</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.entries(hjmDeler).map(([hjmtype, deler]) =>
              deler.map((del, i) => (
                <Table.Row key={i}>
                  <Table.DataCell>{del.hmsnr}</Table.DataCell>
                  <Table.DataCell>{del.navn}</Table.DataCell>
                  <Table.DataCell>{hjmtype}</Table.DataCell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Avstand>
    </div>
  )
}

export default Delliste
