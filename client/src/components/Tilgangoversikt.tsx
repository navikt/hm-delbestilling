import React, { useState } from 'react'

import {
  Alert,
  BodyShort,
  Box,
  Button,
  ConfirmationPanel,
  GuidePanel,
  Heading,
  HelpText,
  HStack,
  Label,
  Link,
  Loader,
  Radio,
  RadioGroup,
  ReadMore,
  Table,
  UNSAFE_Combobox,
} from '@navikt/ds-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { GlobalStyle } from '../GlobalStyle'
import { ROLLER_PATH } from '../services/rest'
import rest from '../services/rest'
import Content from '../styledcomponents/Content'
import { TilgangsforespørselgrunnlagResponse } from '../types/HttpTypes'
import {
  Arbeidsforhold,
  InnsendtTilgangsforespørsel,
  Kommune,
  Rettighet,
  Tilgangsforespørsel,
  Tilgangsforespørselstatus,
} from '../types/Types'

import { Avstand } from './Avstand'

const QUERY_KEY_INNSENDTEFORESPØRSLER = 'innsendteforespørsler'

const IngenTilgang = () => {
  return (
    <main>
      <GlobalStyle />
      <Content>
        <Avstand marginTop={4}>
          <Tilganger />
        </Avstand>
      </Content>
    </main>
  )
}

const Tilganger = () => {
  const { data: innsendteTilgangsforespørsler, isFetching } = useQuery<InnsendtTilgangsforespørsel[]>({
    queryKey: [QUERY_KEY_INNSENDTEFORESPØRSLER],
    queryFn: () => fetch(`${ROLLER_PATH}/tilgang/foresporsel?rettighet=DELBESTILLING`).then((res) => res.json()),
  })

  if (isFetching) {
    return <CenteredLoader />
  }

  const harAktivTilgangsforespørselForDelbestilling = (innsendteTilgangsforespørsler ?? []).some(
    (innsendt) =>
      innsendt.status === Tilgangsforespørselstatus.AVVENTER_BEHANDLING &&
      innsendt.rettighet === Rettighet.DELBESTILLING
  )

  return (
    <>
      {innsendteTilgangsforespørsler && innsendteTilgangsforespørsler.length === 0 && (
        <GuidePanel>
          Det kan se ut som du ikke har tilgang til å bestille deler. Du kan bruke veilederen under for å be om tilgang.
        </GuidePanel>
      )}
      {innsendteTilgangsforespørsler && innsendteTilgangsforespørsler.length > 0 && (
        <InnsendteTilgangsforespørsler
          innsendteTilgangsforespørsler={innsendteTilgangsforespørsler}
          harAktivTilgangsforespørselForDelbestilling={harAktivTilgangsforespørselForDelbestilling}
        />
      )}
      <Avstand marginBottom={2} />
      {!harAktivTilgangsforespørselForDelbestilling && <BeOmTilgang />}
    </>
  )
}

const InnsendteTilgangsforespørsler = ({
  innsendteTilgangsforespørsler,
  harAktivTilgangsforespørselForDelbestilling,
}: {
  innsendteTilgangsforespørsler: InnsendtTilgangsforespørsel[]
  harAktivTilgangsforespørselForDelbestilling: boolean
}) => {
  const queryClient = useQueryClient()
  const { mutate: slettTilgangsforespørsel, isPending: sletterTilgangsforespørsel } = useMutation({
    mutationFn: (id: string) => {
      return rest.slettTilgangsforespørsel(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_INNSENDTEFORESPØRSLER] })
    },
    onError: (error) => {
      alert(error)
    },
  })

  return (
    <Box background="bg-default" padding="8">
      <Heading size="medium" level="2" spacing>
        Dine forespørsler for å bestille deler
      </Heading>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Rettighet</Table.HeaderCell>
            <Table.HeaderCell>Sendt inn</Table.HeaderCell>
            <Table.HeaderCell>Kommune</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            {harAktivTilgangsforespørselForDelbestilling && <Table.HeaderCell>Handling</Table.HeaderCell>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {innsendteTilgangsforespørsler.map((innsendt, i) => (
            <Table.Row key={i}>
              <Table.DataCell>{innsendt.rettighet}</Table.DataCell>
              <Table.DataCell>{new Date().toLocaleDateString()}</Table.DataCell>
              <Table.DataCell>
                {innsendt.påVegneAvKommune && <>{innsendt.påVegneAvKommune.kommunenavn}</>}
                {!innsendt.påVegneAvKommune && <>{innsendt.arbeidsforhold.kommune.kommunenavn}</>}
              </Table.DataCell>
              <Table.DataCell>
                <HStack gap={'1'}>
                  {innsendt.status}
                  {innsendt.status === Tilgangsforespørselstatus.AVSLÅTT && (
                    <HelpText title="Hva gjør jeg nå?">
                      Tilgangsforespørselen din har blitt avslått av Nav Hjelpemiddelsentral. Kontakt din lokale
                      Hjelpemiddelsentral dersom du mener at dette er feil.
                    </HelpText>
                  )}
                </HStack>
              </Table.DataCell>
              <Table.DataCell>
                {innsendt.status !== Tilgangsforespørselstatus.AVSLÅTT && (
                  <Button
                    loading={sletterTilgangsforespørsel}
                    onClick={() => {
                      // TODO vis "er du sikker?"
                      slettTilgangsforespørsel(innsendt.id)
                    }}
                  >
                    Slett
                  </Button>
                )}
              </Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Box>
  )
}

const BeOmTilgang = () => {
  const queryClient = useQueryClient()
  const [valgtArbeidsforhold, setValgtarbeidsforhold] = useState<Arbeidsforhold | undefined>(undefined)
  const [valgteKommuner, setValgteKommuner] = useState<Kommune[]>([])

  const {
    data: grunnlagData,
    isPending: henterGrunnlag,
    error: grunnlagError,
  } = useQuery<TilgangsforespørselgrunnlagResponse>({
    queryKey: ['grunnlag'],
    queryFn: () => fetch(`${ROLLER_PATH}/tilgang/grunnlag`).then((res) => res.json()),
  })
  const { grunnlag } = grunnlagData ?? {}

  const { mutate: sendTilgangsforespørsler, isPending: senderTilgangsforespørsel } = useMutation({
    mutationFn: (arbeidsforhold: Arbeidsforhold) => {
      const forespørsler: Tilgangsforespørsel[] = []

      if (arbeidsforhold.overordnetOrganisasjon.orgform === 'KOMM') {
        forespørsler.push({
          arbeidsforhold,
          navn: grunnlag?.navn!,
          rettighet: Rettighet.DELBESTILLING,
          påVegneAvKommune: undefined,
        })
      } else {
        valgteKommuner.forEach((vk) =>
          forespørsler.push({
            arbeidsforhold,
            navn: grunnlag?.navn!,
            rettighet: Rettighet.DELBESTILLING,
            påVegneAvKommune: vk,
          })
        )
      }

      return rest.sendTilgangsforespørsler(forespørsler)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_INNSENDTEFORESPØRSLER] })
    },
    onError: (error) => {
      alert(error)
    },
  })

  if (henterGrunnlag) {
    return <CenteredLoader />
  }

  if (grunnlagError) {
    return <Alert variant="error">Klarte ikke å hente grunnlag</Alert>
  }

  if (!grunnlag) {
    return <div>Fant ikke noe grunnlag.</div>
  }

  if (grunnlag.arbeidsforhold.length === 0) {
    // TODO vis noe fornuftig her
    return <BodyShort>Du har ingen ansettelsesforhold.</BodyShort>
  }

  return (
    <Box background="bg-default" padding="8">
      <Heading size="medium" level="2" spacing>
        Be om tilgang for å bestille deler
      </Heading>

      <BodyShort spacing>
        Vi ser at du har følgende ansettelsesforhold. Du må velge hvilket ansettelsesforhold tilgangen skal gjelde for.
      </BodyShort>

      <ReadMore header="Jeg ser ikke ansettelsesforholdet mitt">
        Hvis du ikke ser riktig ansettelsesforhold, kan det hende det ikke har blitt registrert i Aareg ennå. Du bør da
        ta kontakt med din hjelpemiddelsentral for videre hjelp.
      </ReadMore>

      <Avstand marginBottom={4} marginTop={6}>
        <RadioGroup
          legend={
            <HStack gap="2">
              <span>Velg ansettelsesforhold</span>
              <HelpText title="Hva er dette?">
                Dette er hentet fra Arbeidsgiver- og arbeidstakerregisteret (Aa-registeret) og Brønnøysundregistrene.
              </HelpText>
            </HStack>
          }
          onChange={(arbeidsforhold: Arbeidsforhold) => {
            setValgtarbeidsforhold(arbeidsforhold)
          }}
        >
          {grunnlag.arbeidsforhold.map((forhold, i) => (
            <Radio value={forhold} key={i}>
              {forhold.stillingstittel} i <Link href="#">{forhold.organisasjon.navn}</Link>
            </Radio>
          ))}
        </RadioGroup>
      </Avstand>
      {valgtArbeidsforhold && valgtArbeidsforhold.overordnetOrganisasjon.orgform !== 'KOMM' && (
        <Avstand marginBottom={4}>
          <UNSAFE_Combobox
            label={`Velg hvilke kommuner ${valgtArbeidsforhold.organisasjon.navn} representerer`}
            options={Object.values(kommuner).map((kommune) => `${kommune.kommunenavn} - ${kommune.fylkesnavn}`)}
            isMultiSelect
            maxSelected={{ limit: 5, message: 'Du kan kun velge 5 kommuner om gangen.' }}
            onToggleSelected={(selected) => {
              const [kommunenavn, fylkesnavn] = selected.split(' - ')
              const kommune = Object.values(kommuner).find(
                (k) => k.kommunenavn === kommunenavn && k.fylkenavn === fylkesnavn
              )

              if (kommune) {
                setValgteKommuner((prev) => [...prev, kommune])
              }
            }}
          ></UNSAFE_Combobox>
          <ReadMore header="Hvorfor må jeg velge dette?">
            {valgtArbeidsforhold.organisasjon.navn} er ikke en kommunal organisasjon. Du må derfor velge hvilke kommuner
            denne organisasjonen har avtale med.
          </ReadMore>
        </Avstand>
      )}

      {valgtArbeidsforhold && (
        <>
          <Box background="bg-subtle" padding="4">
            <Heading level="3" size="small" spacing>
              Dette sendes i forespørselen til Nav
            </Heading>
            <BodyShort>
              <Label>Navn:</Label> Max Mekker
            </BodyShort>
            <BodyShort>
              <Label>Jeg vil:</Label> Bestille deler til hjelpemidler
            </BodyShort>
            <BodyShort>
              <Label>Stillingstittel:</Label> {valgtArbeidsforhold.stillingstittel}
            </BodyShort>
            <BodyShort>
              <Label>Organisasjon:</Label> {valgtArbeidsforhold.organisasjon.navn}
            </BodyShort>
            {valgteKommuner.length > 0 && (
              <BodyShort>
                <Label>På vegne av:</Label> {valgteKommuner.map(({ kommunenavn }) => kommunenavn).join(', ')}
              </BodyShort>
            )}
          </Box>
          <Avstand marginBottom={4}>
            <ConfirmationPanel label="Jeg godtar at tilgangstyrer i Nav kan se denne informasjonen"></ConfirmationPanel>
          </Avstand>
        </>
      )}

      <Button
        onClick={() => {
          if (valgtArbeidsforhold) {
            sendTilgangsforespørsler(valgtArbeidsforhold)
          } else {
            alert('Du må velge arbeidsforhold')
          }
        }}
        loading={senderTilgangsforespørsel}
      >
        Be om tilgang
      </Button>
    </Box>
  )
}

const CenteredLoader = () => {
  return (
    <HStack justify={'center'} padding="8">
      <Loader />
    </HStack>
  )
}

// TODO: fjerne mock, gjør oppslag mot digihot-oppslag
const kommuner: { [kommunenr: string]: Kommune } = {
  '1101': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1101',
    kommunenavn: 'Eigersund',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1103': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1103',
    kommunenavn: 'Stavanger',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1106': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1106',
    kommunenavn: 'Haugesund',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1108': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1108',
    kommunenavn: 'Sandnes',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1111': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1111',
    kommunenavn: 'Sokndal',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1112': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1112',
    kommunenavn: 'Lund',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1114': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1114',
    kommunenavn: 'Bjerkreim',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1119': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1119',
    kommunenavn: 'Hå',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1120': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1120',
    kommunenavn: 'Klepp',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1121': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1121',
    kommunenavn: 'Time',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1122': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1122',
    kommunenavn: 'Gjesdal',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1124': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1124',
    kommunenavn: 'Sola',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1127': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1127',
    kommunenavn: 'Randaberg',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1130': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1130',
    kommunenavn: 'Strand',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1133': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1133',
    kommunenavn: 'Hjelmeland',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1134': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1134',
    kommunenavn: 'Suldal',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1135': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1135',
    kommunenavn: 'Sauda',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1144': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1144',
    kommunenavn: 'Kvitsøy',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1145': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1145',
    kommunenavn: 'Bokn',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1146': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1146',
    kommunenavn: 'Tysvær',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1149': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1149',
    kommunenavn: 'Karmøy',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1151': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1151',
    kommunenavn: 'Utsira',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1160': {
    fylkesnummer: '11',
    fylkesnavn: 'Rogaland',
    kommunenummer: '1160',
    kommunenavn: 'Vindafjord',
    fylkenummer: '11',
    fylkenavn: 'Rogaland',
  },
  '1505': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1505',
    kommunenavn: 'Kristiansund',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1506': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1506',
    kommunenavn: 'Molde',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1508': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1508',
    kommunenavn: 'Ålesund',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1511': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1511',
    kommunenavn: 'Vanylven',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1514': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1514',
    kommunenavn: 'Sande',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1515': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1515',
    kommunenavn: 'Herøy',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1516': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1516',
    kommunenavn: 'Ulstein',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1517': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1517',
    kommunenavn: 'Hareid',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1520': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1520',
    kommunenavn: 'Ørsta',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1525': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1525',
    kommunenavn: 'Stranda',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1528': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1528',
    kommunenavn: 'Sykkylven',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1531': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1531',
    kommunenavn: 'Sula',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1532': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1532',
    kommunenavn: 'Giske',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1535': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1535',
    kommunenavn: 'Vestnes',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1539': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1539',
    kommunenavn: 'Rauma',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1547': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1547',
    kommunenavn: 'Aukra',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1554': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1554',
    kommunenavn: 'Averøy',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1557': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1557',
    kommunenavn: 'Gjemnes',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1560': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1560',
    kommunenavn: 'Tingvoll',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1563': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1563',
    kommunenavn: 'Sunndal',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1566': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1566',
    kommunenavn: 'Surnadal',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1573': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1573',
    kommunenavn: 'Smøla',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1576': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1576',
    kommunenavn: 'Aure',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1577': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1577',
    kommunenavn: 'Volda',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1578': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1578',
    kommunenavn: 'Fjord',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1579': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1579',
    kommunenavn: 'Hustadvika',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1580': {
    fylkesnummer: '15',
    fylkesnavn: 'Møre og Romsdal',
    kommunenummer: '1580',
    kommunenavn: 'Haram',
    fylkenummer: '15',
    fylkenavn: 'Møre og Romsdal',
  },
  '1804': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1804',
    kommunenavn: 'Bodø',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1806': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1806',
    kommunenavn: 'Narvik',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1811': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1811',
    kommunenavn: 'Bindal',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1812': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1812',
    kommunenavn: 'Sømna',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1813': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1813',
    kommunenavn: 'Brønnøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1815': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1815',
    kommunenavn: 'Vega',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1816': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1816',
    kommunenavn: 'Vevelstad',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1818': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1818',
    kommunenavn: 'Herøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1820': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1820',
    kommunenavn: 'Alstahaug',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1822': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1822',
    kommunenavn: 'Leirfjord',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1824': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1824',
    kommunenavn: 'Vefsn',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1825': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1825',
    kommunenavn: 'Grane',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1826': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1826',
    kommunenavn: 'Hattfjelldal',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1827': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1827',
    kommunenavn: 'Dønna',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1828': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1828',
    kommunenavn: 'Nesna',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1832': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1832',
    kommunenavn: 'Hemnes',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1833': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1833',
    kommunenavn: 'Rana',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1834': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1834',
    kommunenavn: 'Lurøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1835': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1835',
    kommunenavn: 'Træna',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1836': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1836',
    kommunenavn: 'Rødøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1837': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1837',
    kommunenavn: 'Meløy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1838': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1838',
    kommunenavn: 'Gildeskål',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1839': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1839',
    kommunenavn: 'Beiarn',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1840': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1840',
    kommunenavn: 'Saltdal',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1841': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1841',
    kommunenavn: 'Fauske',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1845': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1845',
    kommunenavn: 'Sørfold',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1848': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1848',
    kommunenavn: 'Steigen',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1851': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1851',
    kommunenavn: 'Lødingen',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1853': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1853',
    kommunenavn: 'Evenes',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1856': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1856',
    kommunenavn: 'Røst',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1857': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1857',
    kommunenavn: 'Værøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1859': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1859',
    kommunenavn: 'Flakstad',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1860': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1860',
    kommunenavn: 'Vestvågøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1865': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1865',
    kommunenavn: 'Vågan',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1866': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1866',
    kommunenavn: 'Hadsel',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1867': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1867',
    kommunenavn: 'Bø',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1868': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1868',
    kommunenavn: 'Øksnes',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1870': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1870',
    kommunenavn: 'Sortland',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1871': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1871',
    kommunenavn: 'Andøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1874': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1874',
    kommunenavn: 'Moskenes',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '1875': {
    fylkesnummer: '18',
    fylkesnavn: 'Nordland',
    kommunenummer: '1875',
    kommunenavn: 'Hamarøy',
    fylkenummer: '18',
    fylkenavn: 'Nordland',
  },
  '3101': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3101',
    kommunenavn: 'Halden',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3103': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3103',
    kommunenavn: 'Moss',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3105': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3105',
    kommunenavn: 'Sarpsborg',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3107': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3107',
    kommunenavn: 'Fredrikstad',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3110': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3110',
    kommunenavn: 'Hvaler',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3112': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3112',
    kommunenavn: 'Råde',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3114': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3114',
    kommunenavn: 'Våler',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3116': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3116',
    kommunenavn: 'Skiptvet',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3118': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3118',
    kommunenavn: 'Indre Østfold',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3120': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3120',
    kommunenavn: 'Rakkestad',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3122': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3122',
    kommunenavn: 'Marker',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3124': {
    fylkesnummer: '31',
    fylkesnavn: 'Østfold',
    kommunenummer: '3124',
    kommunenavn: 'Aremark',
    fylkenummer: '31',
    fylkenavn: 'Østfold',
  },
  '3201': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3201',
    kommunenavn: 'Bærum',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3203': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3203',
    kommunenavn: 'Asker',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3205': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3205',
    kommunenavn: 'Lillestrøm',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3207': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3207',
    kommunenavn: 'Nordre Follo',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3209': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3209',
    kommunenavn: 'Ullensaker',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3212': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3212',
    kommunenavn: 'Nesodden',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3214': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3214',
    kommunenavn: 'Frogn',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3216': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3216',
    kommunenavn: 'Vestby',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3218': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3218',
    kommunenavn: 'Ås',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3220': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3220',
    kommunenavn: 'Enebakk',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3222': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3222',
    kommunenavn: 'Lørenskog',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3224': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3224',
    kommunenavn: 'Rælingen',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3226': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3226',
    kommunenavn: 'Aurskog-Høland',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3228': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3228',
    kommunenavn: 'Nes',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3230': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3230',
    kommunenavn: 'Gjerdrum',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3232': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3232',
    kommunenavn: 'Nittedal',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3234': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3234',
    kommunenavn: 'Lunner',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3236': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3236',
    kommunenavn: 'Jevnaker',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3238': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3238',
    kommunenavn: 'Nannestad',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3240': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3240',
    kommunenavn: 'Eidsvoll',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3242': {
    fylkesnummer: '32',
    fylkesnavn: 'Akershus',
    kommunenummer: '3242',
    kommunenavn: 'Hurdal',
    fylkenummer: '32',
    fylkenavn: 'Akershus',
  },
  '3301': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3301',
    kommunenavn: 'Drammen',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3303': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3303',
    kommunenavn: 'Kongsberg',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3305': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3305',
    kommunenavn: 'Ringerike',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3310': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3310',
    kommunenavn: 'Hole',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3312': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3312',
    kommunenavn: 'Lier',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3314': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3314',
    kommunenavn: 'Øvre Eiker',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3316': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3316',
    kommunenavn: 'Modum',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3318': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3318',
    kommunenavn: 'Krødsherad',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3320': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3320',
    kommunenavn: 'Flå',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3322': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3322',
    kommunenavn: 'Nesbyen',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3324': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3324',
    kommunenavn: 'Gol',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3326': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3326',
    kommunenavn: 'Hemsedal',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3328': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3328',
    kommunenavn: 'Ål',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3330': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3330',
    kommunenavn: 'Hol',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3332': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3332',
    kommunenavn: 'Sigdal',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3334': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3334',
    kommunenavn: 'Flesberg',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3336': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3336',
    kommunenavn: 'Rollag',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3338': {
    fylkesnummer: '33',
    fylkesnavn: 'Buskerud',
    kommunenummer: '3338',
    kommunenavn: 'Nore og Uvdal',
    fylkenummer: '33',
    fylkenavn: 'Buskerud',
  },
  '3401': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3401',
    kommunenavn: 'Kongsvinger',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3403': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3403',
    kommunenavn: 'Hamar',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3405': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3405',
    kommunenavn: 'Lillehammer',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3407': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3407',
    kommunenavn: 'Gjøvik',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3411': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3411',
    kommunenavn: 'Ringsaker',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3412': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3412',
    kommunenavn: 'Løten',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3413': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3413',
    kommunenavn: 'Stange',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3414': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3414',
    kommunenavn: 'Nord-Odal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3415': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3415',
    kommunenavn: 'Sør-Odal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3416': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3416',
    kommunenavn: 'Eidskog',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3417': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3417',
    kommunenavn: 'Grue',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3418': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3418',
    kommunenavn: 'Åsnes',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3419': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3419',
    kommunenavn: 'Våler',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3420': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3420',
    kommunenavn: 'Elverum',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3421': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3421',
    kommunenavn: 'Trysil',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3422': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3422',
    kommunenavn: 'Åmot',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3423': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3423',
    kommunenavn: 'Stor-Elvdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3424': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3424',
    kommunenavn: 'Rendalen',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3425': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3425',
    kommunenavn: 'Engerdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3426': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3426',
    kommunenavn: 'Tolga',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3427': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3427',
    kommunenavn: 'Tynset',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3428': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3428',
    kommunenavn: 'Alvdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3429': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3429',
    kommunenavn: 'Folldal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3430': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3430',
    kommunenavn: 'Os',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3431': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3431',
    kommunenavn: 'Dovre',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3432': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3432',
    kommunenavn: 'Lesja',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3433': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3433',
    kommunenavn: 'Skjåk',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3434': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3434',
    kommunenavn: 'Lom',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3435': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3435',
    kommunenavn: 'Vågå',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3436': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3436',
    kommunenavn: 'Nord-Fron',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3437': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3437',
    kommunenavn: 'Sel',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3438': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3438',
    kommunenavn: 'Sør-Fron',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3439': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3439',
    kommunenavn: 'Ringebu',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3440': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3440',
    kommunenavn: 'Øyer',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3441': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3441',
    kommunenavn: 'Gausdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3442': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3442',
    kommunenavn: 'Østre Toten',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3443': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3443',
    kommunenavn: 'Vestre Toten',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3446': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3446',
    kommunenavn: 'Gran',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3447': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3447',
    kommunenavn: 'Søndre Land',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3448': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3448',
    kommunenavn: 'Nordre Land',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3449': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3449',
    kommunenavn: 'Sør-Aurdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3450': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3450',
    kommunenavn: 'Etnedal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3451': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3451',
    kommunenavn: 'Nord-Aurdal',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3452': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3452',
    kommunenavn: 'Vestre Slidre',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3453': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3453',
    kommunenavn: 'Øystre Slidre',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3454': {
    fylkesnummer: '34',
    fylkesnavn: 'Innlandet',
    kommunenummer: '3454',
    kommunenavn: 'Vang',
    fylkenummer: '34',
    fylkenavn: 'Innlandet',
  },
  '3901': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3901',
    kommunenavn: 'Horten',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '3903': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3903',
    kommunenavn: 'Holmestrand',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '3905': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3905',
    kommunenavn: 'Tønsberg',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '3907': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3907',
    kommunenavn: 'Sandefjord',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '3909': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3909',
    kommunenavn: 'Larvik',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '3911': {
    fylkesnummer: '39',
    fylkesnavn: 'Vestfold',
    kommunenummer: '3911',
    kommunenavn: 'Færder',
    fylkenummer: '39',
    fylkenavn: 'Vestfold',
  },
  '4001': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4001',
    kommunenavn: 'Porsgrunn',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4003': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4003',
    kommunenavn: 'Skien',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4005': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4005',
    kommunenavn: 'Notodden',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4010': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4010',
    kommunenavn: 'Siljan',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4012': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4012',
    kommunenavn: 'Bamble',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4014': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4014',
    kommunenavn: 'Kragerø',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4016': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4016',
    kommunenavn: 'Drangedal',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4018': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4018',
    kommunenavn: 'Nome',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4020': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4020',
    kommunenavn: 'Midt-Telemark',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4022': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4022',
    kommunenavn: 'Seljord',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4024': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4024',
    kommunenavn: 'Hjartdal',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4026': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4026',
    kommunenavn: 'Tinn',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4028': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4028',
    kommunenavn: 'Kviteseid',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4030': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4030',
    kommunenavn: 'Nissedal',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4032': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4032',
    kommunenavn: 'Fyresdal',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4034': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4034',
    kommunenavn: 'Tokke',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4036': {
    fylkesnummer: '40',
    fylkesnavn: 'Telemark',
    kommunenummer: '4036',
    kommunenavn: 'Vinje',
    fylkenummer: '40',
    fylkenavn: 'Telemark',
  },
  '4201': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4201',
    kommunenavn: 'Risør',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4202': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4202',
    kommunenavn: 'Grimstad',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4203': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4203',
    kommunenavn: 'Arendal',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4204': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4204',
    kommunenavn: 'Kristiansand',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4205': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4205',
    kommunenavn: 'Lindesnes',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4206': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4206',
    kommunenavn: 'Farsund',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4207': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4207',
    kommunenavn: 'Flekkefjord',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4211': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4211',
    kommunenavn: 'Gjerstad',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4212': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4212',
    kommunenavn: 'Vegårshei',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4213': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4213',
    kommunenavn: 'Tvedestrand',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4214': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4214',
    kommunenavn: 'Froland',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4215': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4215',
    kommunenavn: 'Lillesand',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4216': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4216',
    kommunenavn: 'Birkenes',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4217': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4217',
    kommunenavn: 'Åmli',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4218': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4218',
    kommunenavn: 'Iveland',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4219': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4219',
    kommunenavn: 'Evje og Hornnes',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4220': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4220',
    kommunenavn: 'Bygland',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4221': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4221',
    kommunenavn: 'Valle',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4222': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4222',
    kommunenavn: 'Bykle',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4223': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4223',
    kommunenavn: 'Vennesla',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4224': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4224',
    kommunenavn: 'Åseral',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4225': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4225',
    kommunenavn: 'Lyngdal',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4226': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4226',
    kommunenavn: 'Hægebostad',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4227': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4227',
    kommunenavn: 'Kvinesdal',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4228': {
    fylkesnummer: '42',
    fylkesnavn: 'Agder',
    kommunenummer: '4228',
    kommunenavn: 'Sirdal',
    fylkenummer: '42',
    fylkenavn: 'Agder',
  },
  '4601': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4601',
    kommunenavn: 'Bergen',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4602': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4602',
    kommunenavn: 'Kinn',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4611': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4611',
    kommunenavn: 'Etne',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4612': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4612',
    kommunenavn: 'Sveio',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4613': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4613',
    kommunenavn: 'Bømlo',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4614': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4614',
    kommunenavn: 'Stord',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4615': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4615',
    kommunenavn: 'Fitjar',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4616': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4616',
    kommunenavn: 'Tysnes',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4617': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4617',
    kommunenavn: 'Kvinnherad',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4618': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4618',
    kommunenavn: 'Ullensvang',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4619': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4619',
    kommunenavn: 'Eidfjord',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4620': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4620',
    kommunenavn: 'Ulvik',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4621': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4621',
    kommunenavn: 'Voss',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4622': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4622',
    kommunenavn: 'Kvam',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4623': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4623',
    kommunenavn: 'Samnanger',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4624': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4624',
    kommunenavn: 'Bjørnafjorden',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4625': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4625',
    kommunenavn: 'Austevoll',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4626': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4626',
    kommunenavn: 'Øygarden',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4627': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4627',
    kommunenavn: 'Askøy',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4628': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4628',
    kommunenavn: 'Vaksdal',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4629': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4629',
    kommunenavn: 'Modalen',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4630': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4630',
    kommunenavn: 'Osterøy',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4631': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4631',
    kommunenavn: 'Alver',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4632': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4632',
    kommunenavn: 'Austrheim',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4633': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4633',
    kommunenavn: 'Fedje',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4634': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4634',
    kommunenavn: 'Masfjorden',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4635': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4635',
    kommunenavn: 'Gulen',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4636': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4636',
    kommunenavn: 'Solund',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4637': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4637',
    kommunenavn: 'Hyllestad',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4638': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4638',
    kommunenavn: 'Høyanger',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4639': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4639',
    kommunenavn: 'Vik',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4640': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4640',
    kommunenavn: 'Sogndal',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4641': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4641',
    kommunenavn: 'Aurland',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4642': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4642',
    kommunenavn: 'Lærdal',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4643': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4643',
    kommunenavn: 'Årdal',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4644': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4644',
    kommunenavn: 'Luster',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4645': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4645',
    kommunenavn: 'Askvoll',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4646': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4646',
    kommunenavn: 'Fjaler',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4647': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4647',
    kommunenavn: 'Sunnfjord',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4648': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4648',
    kommunenavn: 'Bremanger',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4649': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4649',
    kommunenavn: 'Stad',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4650': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4650',
    kommunenavn: 'Gloppen',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '4651': {
    fylkesnummer: '46',
    fylkesnavn: 'Vestland',
    kommunenummer: '4651',
    kommunenavn: 'Stryn',
    fylkenummer: '46',
    fylkenavn: 'Vestland',
  },
  '5001': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5001',
    kommunenavn: 'Trondheim',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5006': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5006',
    kommunenavn: 'Steinkjer',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5007': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5007',
    kommunenavn: 'Namsos',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5014': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5014',
    kommunenavn: 'Frøya',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5020': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5020',
    kommunenavn: 'Osen',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5021': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5021',
    kommunenavn: 'Oppdal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5022': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5022',
    kommunenavn: 'Rennebu',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5025': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5025',
    kommunenavn: 'Røros',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5026': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5026',
    kommunenavn: 'Holtålen',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5027': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5027',
    kommunenavn: 'Midtre Gauldal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5028': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5028',
    kommunenavn: 'Melhus',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5029': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5029',
    kommunenavn: 'Skaun',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5031': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5031',
    kommunenavn: 'Malvik',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5032': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5032',
    kommunenavn: 'Selbu',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5033': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5033',
    kommunenavn: 'Tydal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5034': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5034',
    kommunenavn: 'Meråker',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5035': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5035',
    kommunenavn: 'Stjørdal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5036': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5036',
    kommunenavn: 'Frosta',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5037': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5037',
    kommunenavn: 'Levanger',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5038': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5038',
    kommunenavn: 'Verdal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5041': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5041',
    kommunenavn: 'Snåsa',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5042': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5042',
    kommunenavn: 'Lierne',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5043': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5043',
    kommunenavn: 'Røyrvik',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5044': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5044',
    kommunenavn: 'Namsskogan',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5045': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5045',
    kommunenavn: 'Grong',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5046': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5046',
    kommunenavn: 'Høylandet',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5047': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5047',
    kommunenavn: 'Overhalla',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5049': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5049',
    kommunenavn: 'Flatanger',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5052': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5052',
    kommunenavn: 'Leka',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5053': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5053',
    kommunenavn: 'Inderøy',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5054': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5054',
    kommunenavn: 'Indre Fosen',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5055': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5055',
    kommunenavn: 'Heim',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5056': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5056',
    kommunenavn: 'Hitra',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5057': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5057',
    kommunenavn: 'Ørland',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5058': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5058',
    kommunenavn: 'Åfjord',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5059': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5059',
    kommunenavn: 'Orkland',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5060': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5060',
    kommunenavn: 'Nærøysund',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5061': {
    fylkesnummer: '50',
    fylkesnavn: 'Trøndelag',
    kommunenummer: '5061',
    kommunenavn: 'Rindal',
    fylkenummer: '50',
    fylkenavn: 'Trøndelag',
  },
  '5501': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5501',
    kommunenavn: 'Tromsø',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5503': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5503',
    kommunenavn: 'Harstad',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5510': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5510',
    kommunenavn: 'Kvæfjord',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5512': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5512',
    kommunenavn: 'Tjeldsund',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5514': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5514',
    kommunenavn: 'Ibestad',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5516': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5516',
    kommunenavn: 'Gratangen',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5518': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5518',
    kommunenavn: 'Lavangen',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5520': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5520',
    kommunenavn: 'Bardu',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5522': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5522',
    kommunenavn: 'Salangen',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5524': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5524',
    kommunenavn: 'Målselv',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5526': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5526',
    kommunenavn: 'Sørreisa',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5528': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5528',
    kommunenavn: 'Dyrøy',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5530': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5530',
    kommunenavn: 'Senja',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5532': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5532',
    kommunenavn: 'Balsfjord',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5534': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5534',
    kommunenavn: 'Karlsøy',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5536': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5536',
    kommunenavn: 'Lyngen',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5538': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5538',
    kommunenavn: 'Storfjord',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5540': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5540',
    kommunenavn: 'Kåfjord',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5542': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5542',
    kommunenavn: 'Skjervøy',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5544': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5544',
    kommunenavn: 'Nordreisa',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5546': {
    fylkesnummer: '55',
    fylkesnavn: 'Troms',
    kommunenummer: '5546',
    kommunenavn: 'Kvænangen',
    fylkenummer: '55',
    fylkenavn: 'Troms',
  },
  '5601': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5601',
    kommunenavn: 'Alta',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5603': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5603',
    kommunenavn: 'Hammerfest',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5605': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5605',
    kommunenavn: 'Sør-Varanger',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5607': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5607',
    kommunenavn: 'Vadsø',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5610': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5610',
    kommunenavn: 'Karasjok',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5612': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5612',
    kommunenavn: 'Kautokeino',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5614': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5614',
    kommunenavn: 'Loppa',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5616': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5616',
    kommunenavn: 'Hasvik',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5618': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5618',
    kommunenavn: 'Måsøy',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5620': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5620',
    kommunenavn: 'Nordkapp',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5622': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5622',
    kommunenavn: 'Porsanger',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5624': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5624',
    kommunenavn: 'Lebesby',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5626': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5626',
    kommunenavn: 'Gamvik',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5628': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5628',
    kommunenavn: 'Tana',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5630': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5630',
    kommunenavn: 'Berlevåg',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5632': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5632',
    kommunenavn: 'Båtsfjord',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5634': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5634',
    kommunenavn: 'Vardø',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '5636': {
    fylkesnummer: '56',
    fylkesnavn: 'Finnmark',
    kommunenummer: '5636',
    kommunenavn: 'Nesseby',
    fylkenummer: '56',
    fylkenavn: 'Finnmark',
  },
  '0301': {
    fylkesnummer: '03',
    fylkesnavn: 'Oslo',
    kommunenummer: '0301',
    kommunenavn: 'Oslo',
    fylkenummer: '03',
    fylkenavn: 'Oslo',
  },
}

export default IngenTilgang
