import React, { useEffect, useState } from 'react'
import { Button, Heading, HStack, Table } from '@navikt/ds-react'
import rest from '../services/rest'
import { Dellinje, Hjelpemiddel } from '../types/Types'
import { Avstand } from './Avstand'

interface Props {
  hjelpemiddel: Hjelpemiddel
  serienr: string
}

export const BestilteDeler = ({ hjelpemiddel, serienr }: Props) => {
  const [visBestilteDeler, setVisBestilteDeler] = useState(false)
  const [bestilteDeler, setBestilteDeler] = useState<Dellinje[] | undefined>(undefined)

  useEffect(() => {
    ;(async () => {
      if (visBestilteDeler) {
        try {
          const response = await rest.hentTidligereBestilteDeler(hjelpemiddel.hmsnr, serienr)
          setBestilteDeler(response.dellinjer)
        } catch {
          alert('Klarte ikke hente tidligere bestilte deler')
        }
      }
    })()
  }, [visBestilteDeler])

  if (!visBestilteDeler) {
    return (
      <Button variant="secondary" onClick={() => setVisBestilteDeler(true)}>
        Vis tidligere digitale delbestillinger
      </Button>
    )
  }

  if (!bestilteDeler) {
    return null
  }

  if (bestilteDeler.length === 0) {
    return <div>Dette produktet har ingen tidligere digitale delbestillinger.</div>
  }

  return (
    <Avstand marginTop={5}>
      <Heading size="small">Tidligere digitale delbestillinger til {hjelpemiddel.navn}</Heading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Hmsnr</Table.HeaderCell>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bestilteDeler.map((delLinje, i) => {
            return (
              <Table.Row key={i}>
                <Table.DataCell>{delLinje.del.hmsnr}</Table.DataCell>
                <Table.DataCell>{delLinje.del.navn}</Table.DataCell>
                <Table.DataCell>{delLinje.status}</Table.DataCell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <HStack justify="end">
        <Button variant="tertiary" onClick={() => setVisBestilteDeler(false)}>
          Lukk
        </Button>
      </HStack>
    </Avstand>
  )
}
