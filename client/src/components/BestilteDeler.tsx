import React, { useState } from 'react'
import { BodyShort, ExpansionCard, HStack, Loader, Table } from '@navikt/ds-react'
import { formaterNorskDato } from '../helpers/utils'
import rest from '../services/rest'
import { DelbestillingSak, Hjelpemiddel } from '../types/Types'
import { Avstand } from './Avstand'

interface Props {
  hjelpemiddel: Hjelpemiddel
  serienr: string
}

export const BestilteDeler = ({ hjelpemiddel, serienr }: Props) => {
  const [tidligereSaker, setTidligereSaker] = useState<DelbestillingSak[] | undefined>(undefined)

  const hentTidligereBestilteDeler = async () => {
    setTidligereSaker(undefined)
    try {
      const response = await rest.hentTidligereBestilteDeler(hjelpemiddel.hmsnr, serienr)
      setTidligereSaker(response.saker)
    } catch {
      alert('Klarte ikke hente tidligere bestilte deler')
      setTidligereSaker(undefined)
    }
  }

  return (
    <Avstand marginTop={5}>
      <ExpansionCard
        aria-label="Tidligere bestilte deler"
        size="small"
        onToggle={(open) => {
          if (open) {
            hentTidligereBestilteDeler()
          }
        }}
      >
        <ExpansionCard.Header>
          <ExpansionCard.Title>Tidligere bestilte deler</ExpansionCard.Title>
        </ExpansionCard.Header>
        <ExpansionCard.Content>
          <BodyShort spacing>
            Vi kan kun vise digitale delbestillinger, og ikke deler som er bestilt på andre måter.
          </BodyShort>

          {!tidligereSaker && (
            <HStack justify="center">
              <Loader />
            </HStack>
          )}

          {tidligereSaker && tidligereSaker.length === 0 && (
            <div>Dette produktet har ingen tidligere digitale delbestillinger.</div>
          )}

          {tidligereSaker && tidligereSaker.length > 0 && (
            <Table>
              {/* <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Hmsnr</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header> */}
              <Table.Body>
                {tidligereSaker.map((sak, i) => {
                  const { deler } = sak.delbestilling
                  return (
                    <>
                      <Table.Row>
                        <strong>Bestilt {formaterNorskDato(sak.opprettet)}</strong>
                      </Table.Row>
                      {deler.map((dellinje) => {
                        return (
                          <Table.Row key={i}>
                            <Table.DataCell>{dellinje.del.hmsnr}</Table.DataCell>
                            <Table.DataCell>{dellinje.antall} stk.</Table.DataCell>
                            <Table.DataCell>{dellinje.del.navn}</Table.DataCell>
                          </Table.Row>
                        )
                      })}
                    </>
                  )
                })}
              </Table.Body>
            </Table>
          )}
        </ExpansionCard.Content>
      </ExpansionCard>
    </Avstand>
  )
}
