import React, { useEffect, useState } from 'react'

import { Detail, Heading, Loader, Table } from '@navikt/ds-react'

import rest from '../services/rest'
import { DellisteResponse } from '../types/HttpTypes'
import { Avstand } from '../components/Avstand'

const Delliste = () => {
  const [delliste, setDelliste] = useState<DellisteResponse | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    rest
      .hentAlleDeler()
      .then((result) => setDelliste(result))
      .catch((error) => setError(true))
  }, [])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: 80 }}>
        <p>Det har skjedd en feil. Klarte ikke å hente ut oversikt over deler.</p>
      </div>
    )
  }

  if (!delliste) {
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
          <Detail>Sist oppdatert: {delliste.sistOppdatert}</Detail>
        </Avstand>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Art.nr.</Table.HeaderCell>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell style={{ minWidth: '10rem' }}>Hjelpemiddel</Table.HeaderCell>
              <Table.HeaderCell style={{ minWidth: '7rem' }}>Dato lagt til</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {delliste.deler.map((del, i) => (
              <Table.Row key={i}>
                <Table.DataCell>{del.hmsnr}</Table.DataCell>
                <Table.DataCell>{del.navn}</Table.DataCell>
                <Table.DataCell>{del.hjmNavn}</Table.DataCell>
                <Table.DataCell>{del.lagtTil}</Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Avstand>
    </div>
  )
}

export default Delliste
