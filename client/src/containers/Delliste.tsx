import React, { useEffect, useState } from 'react'

import { Detail, Heading, Loader, Table } from '@navikt/ds-react'

import rest from '../services/rest'
import { DellisteOversiktResponse } from '../types/HttpTypes'
import { Avstand } from '../components/Avstand'

const Delliste = () => {
  const [dellisteOversikt, setDellisteOversikt] = useState<DellisteOversiktResponse | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    rest
      .hentAlleDeler()
      .then((result) => setDellisteOversikt(result))
      .catch((error) => setError(true))
  }, [])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: 80 }}>
        <p>Det har skjedd en feil. Klarte ikke å hente ut oversikt over deler.</p>
      </div>
    )
  }

  if (!dellisteOversikt) {
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
          <Detail>Sist oppdatert: {dellisteOversikt.oppdatert}</Detail>
        </Avstand>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Art.nr.</Table.HeaderCell>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Hjelpemiddel</Table.HeaderCell>
              <Table.HeaderCell scope="col">Lagt til</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.entries(dellisteOversikt.deler).map(([hjmtype, deler]) =>
              deler.map((del, i) => (
                <Table.Row key={i}>
                  <Table.DataCell>{del.hmsnr}</Table.DataCell>
                  <Table.DataCell>{del.navn}</Table.DataCell>
                  <Table.DataCell>{hjmtype}</Table.DataCell>
                  <Table.DataCell>{del.datoLagtTil}</Table.DataCell>
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
