import React, { SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  Skeleton,
  Table,
  UNSAFE_Combobox,
} from '@navikt/ds-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { GlobalStyle } from '../GlobalStyle'
import { QUERY_KEY_DELBESTILLERROLLE } from '../hooks/useRolle'
import { Kommuner, ROLLER_PATH } from '../services/rest'
import rest from '../services/rest'
import Content from '../styledcomponents/Content'
import {
  Arbeidsforhold,
  InnsendtTilgangsforespørsel,
  Kommune,
  Rettighet,
  Tilgang,
  Tilgangsforespørsel,
  Tilgangsforespørselgrunnlag,
  Tilgangsforespørselstatus,
  Tilgangstatus,
} from '../types/Types'

import { Avstand } from './Avstand'

const QUERY_KEY_INNSENDTE_TILGANGSFORESPØRSLER = 'innsendteforespørsler'
const QUERY_KEY_TILGANGER = 'tilganger'

const Tilgangsoversikt = () => {
  const navigate = useNavigate()

  return (
    <main>
      <GlobalStyle />
      <Content>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            navigate(-1)
          }}
        >
          Tilbake
        </Link>
        <Avstand marginTop={4}>
          <Avstand marginBottom={4}>
            <Tilganger />
          </Avstand>
          <Avstand marginBottom={4}>
            <InnsendteTilgangsforespørsler />
          </Avstand>
          <Admin />
        </Avstand>
      </Content>
    </main>
  )
}

const Tilganger = () => {
  const { data: tilganger, isFetching: henterTilganger } = useQuery<Tilgang[]>({
    queryKey: [QUERY_KEY_TILGANGER],
    queryFn: () => rest.hentTilganger(),
  })

  if (henterTilganger) {
    // return <CenteredLoader />
    return null
  }

  if (!tilganger) {
    return <div>Fant ingen tilganger</div>
  }

  const aktiveTilganger = tilganger.filter((t) => t.status === Tilgangstatus.AKTIV)
  const inaktiveTilganger = tilganger.filter((t) => t.status !== Tilgangstatus.AKTIV)

  return (
    <>
      {aktiveTilganger.length === 0 && (
        <GuidePanel>
          Det kan se ut som du ikke har noen aktive tilganger til å bestille deler. Du kan bruke veilederen under for å
          be om tilgang.
        </GuidePanel>
      )}
      {aktiveTilganger.length > 0 && (
        <Alert variant="success">
          <BodyShort>Du har allerede disse tilgangene:</BodyShort>
          <ul>
            {tilganger.map((t, i) => (
              <li key={i}>
                {t.rettighet} for {t.arbeidsforhold.organisasjon.navn}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {inaktiveTilganger.length > 0 && (
        <div>
          Du har følgende inaktive tilganger:{' '}
          {inaktiveTilganger.map(
            (t) => `${t.rettighet} for ${t.arbeidsforhold.organisasjon.navn}. Status: ${t.status}`
          )}
        </div>
      )}
    </>
  )
}

const InnsendteTilgangsforespørsler = () => {
  const queryClient = useQueryClient()

  const {
    data: innsendteTilgangsforespørsler,
    isFetching: henterInnsendteTilgangsforespørsler,
    error: innsendteTilgangsforespørslerError,
  } = useInnsendteTilgangsforespørsler()

  const { mutate: slettTilgangsforespørsel, isPending: sletterTilgangsforespørsel } = useMutation({
    mutationFn: (id: string) => rest.slettTilgangsforespørsel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_INNSENDTE_TILGANGSFORESPØRSLER] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DELBESTILLERROLLE] })
      window.scrollTo(0, 0)
    },
    onError: (error) => {
      alert(error)
    },
  })

  if (henterInnsendteTilgangsforespørsler) {
    return <CenteredLoader />
  }

  if (innsendteTilgangsforespørslerError) {
    return (
      <>
        <Avstand marginBottom={4}>
          <Alert variant="error">Klarte ikke å hente innsendte tilgangsforespørsler. Prøv igjen senere.</Alert>
        </Avstand>
        <BeOmTilgang />
      </>
    )
  }

  if (!innsendteTilgangsforespørsler) {
    return <div>Ingen innsendte tilgangsforespørsler</div>
  }

  if (innsendteTilgangsforespørsler.length === 0) {
    return <BeOmTilgang />
  }

  const harAktivTilgangsforespørselForDelbestilling = innsendteTilgangsforespørsler.some(
    (innsendt) =>
      innsendt.status === Tilgangsforespørselstatus.AVVENTER_BEHANDLING &&
      innsendt.rettighet === Rettighet.DELBESTILLING
  )

  return (
    <>
      <Box background="bg-default" padding="8">
        <Heading size="medium" level="2" spacing>
          Dine tilgangsforespørsler
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
                  <HStack gap="1">
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
                  {innsendt.status === Tilgangsforespørselstatus.AVVENTER_BEHANDLING && (
                    <Button
                      loading={sletterTilgangsforespørsel}
                      onClick={() => {
                        if (window.confirm('Er du sikker på at du vil slette denne forespørselen?')) {
                          slettTilgangsforespørsel(innsendt.id)
                        }
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
      {!harAktivTilgangsforespørselForDelbestilling && (
        <Avstand marginTop={2}>
          <BeOmTilgang />
        </Avstand>
      )}
    </>
  )
}

const KOMMUNAL_ORGFORM = 'KOMM'

const BeOmTilgang = () => {
  const queryClient = useQueryClient()
  const [valgtArbeidsforhold, setValgtarbeidsforhold] = useState<Arbeidsforhold | undefined>(undefined)
  const [valgteKommuner, setValgteKommuner] = useState<Kommune[]>([])

  const {
    data: grunnlag,
    isPending: henterGrunnlag,
    error: grunnlagError,
  } = useQuery<Tilgangsforespørselgrunnlag>({
    queryKey: ['grunnlag'],
    queryFn: () => rest.hentTilgangsforespørselgrunnlag(),
  })

  const { mutate: sendTilgangsforespørsler, isPending: senderTilgangsforespørsel } = useMutation({
    mutationFn: (arbeidsforhold: Arbeidsforhold) => {
      const forespørsler: Tilgangsforespørsel[] = []

      if (arbeidsforhold.overordnetOrganisasjon.form === KOMMUNAL_ORGFORM) {
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_INNSENDTE_TILGANGSFORESPØRSLER] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DELBESTILLERROLLE] })
      window.scrollTo(0, 0)
    },
    onError: (error) => {
      alert(error)
    },
  })

  if (grunnlagError) {
    return <Alert variant="error">Klarte ikke å hente grunnlag</Alert>
  }

  return (
    <Box background="bg-default" padding="8">
      <Heading size="medium" level="2" spacing>
        Be om tilgang for å bestille deler
      </Heading>

      {henterGrunnlag ? (
        <CenteredLoader />
      ) : !grunnlag ? (
        <BodyShort>Fant ikke noe grunnlag.</BodyShort>
      ) : grunnlag.arbeidsforhold.length === 0 ? (
        <>
          <BodyShort>Du har ingen registrerte ansettelsesforhold.</BodyShort>
          <ReadMore header="Hva gjør jeg nå?">
            Hvis du ikke ser riktig ansettelsesforhold, kan det hende det ikke har blitt registrert i Aareg ennå. Du bør
            da ta kontakt med din hjelpemiddelsentral for videre hjelp.
          </ReadMore>
        </>
      ) : (
        <>
          <BodyShort spacing>
            Vi ser at du har følgende ansettelsesforhold. Du må velge hvilket ansettelsesforhold tilgangen skal gjelde
            for.
          </BodyShort>

          <ReadMore header="Jeg ser ikke ansettelsesforholdet mitt">
            Hvis du ikke ser riktig ansettelsesforhold, kan det hende det ikke har blitt registrert i Aareg ennå. Du bør
            da ta kontakt med din hjelpemiddelsentral for videre hjelp.
          </ReadMore>

          <Avstand marginBottom={4} marginTop={6}>
            <RadioGroup
              legend={
                <HStack gap="2">
                  <span>Velg ansettelsesforhold</span>
                  <HelpText title="Hva er dette?">
                    Dette er hentet fra Arbeidsgiver- og arbeidstakerregisteret (Aa-registeret) og
                    Brønnøysundregistrene.
                  </HelpText>
                </HStack>
              }
              onChange={(arbeidsforhold: Arbeidsforhold) => {
                setValgtarbeidsforhold(arbeidsforhold)
                setValgteKommuner([])
              }}
            >
              {grunnlag.arbeidsforhold.map((forhold, i) => (
                <Radio value={forhold} key={i}>
                  {forhold.stillingstittel} i <Link href="#">{forhold.organisasjon.navn}</Link>
                </Radio>
              ))}
            </RadioGroup>
          </Avstand>
          {valgtArbeidsforhold && (
            <>
              {valgtArbeidsforhold.overordnetOrganisasjon.form !== KOMMUNAL_ORGFORM && (
                <Avstand marginBottom={4}>
                  <Kommunevalg valgtArbeidsforhold={valgtArbeidsforhold} setValgteKommuner={setValgteKommuner} />
                </Avstand>
              )}

              <Box background="bg-subtle" padding="4">
                <Heading level="3" size="small" spacing>
                  Dette sendes i forespørselen til Nav
                </Heading>
                <BodyShort>
                  <Label>Navn:</Label> {grunnlag.navn}
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
        </>
      )}
    </Box>
  )
}

const Kommunevalg = ({
  valgtArbeidsforhold,
  setValgteKommuner,
}: {
  valgtArbeidsforhold: Arbeidsforhold
  setValgteKommuner: React.Dispatch<SetStateAction<Kommune[]>>
}) => {
  const {
    data: kommuner,
    isPending: henterKommuner,
    error: kommunerError,
  } = useQuery<Kommuner>({
    queryKey: ['kommuner'],
    queryFn: () => rest.hentKommuner(),
  })

  if (henterKommuner) {
    return <Skeleton variant="rectangle" height={80} />
  }

  if (kommunerError) {
    return <Alert variant="error">Klarte ikke hente kommuner. Prøv igjen senere.</Alert>
  }

  return (
    <>
      <UNSAFE_Combobox
        label={`Velg hvilke kommuner ${valgtArbeidsforhold.organisasjon.navn} representerer`}
        options={Object.values(kommuner).map((kommune) => `${kommune.kommunenavn} - ${kommune.fylkenavn}`)}
        isMultiSelect
        maxSelected={{ limit: 5, message: 'Du kan kun velge 5 kommuner om gangen.' }}
        onToggleSelected={(option, isSelected) => {
          const [kommunenavn, fylkesnavn] = option.split(' - ')

          const kommune = Object.values(kommuner).find(
            (k) => k.kommunenavn === kommunenavn && k.fylkenavn === fylkesnavn
          )

          if (kommune) {
            if (isSelected) {
              setValgteKommuner((prev) => [...prev, kommune])
            } else {
              // TODO: fix hackete
              setValgteKommuner((prev) => prev.filter((k) => `${k.kommunenavn} - ${k.fylkenavn}` !== option))
            }
          }
        }}
      />
      <ReadMore header="Hvorfor må jeg velge dette?">
        {valgtArbeidsforhold.overordnetOrganisasjon.navn} er ikke en kommunal organisasjon. Du må derfor velge hvilke
        kommuner denne organisasjonen har avtale med.
      </ReadMore>
    </>
  )
}

const useInnsendteTilgangsforespørsler = () => {
  return useQuery<InnsendtTilgangsforespørsel[]>({
    queryKey: [QUERY_KEY_INNSENDTE_TILGANGSFORESPØRSLER],
    queryFn: () => fetch(`${ROLLER_PATH}/tilgang/foresporsel?rettighet=DELBESTILLING`).then((res) => res.json()),
  })
}

const Admin = () => {
  const queryClient = useQueryClient()

  const { data: innsendteTilgangsforespørsler } = useInnsendteTilgangsforespørsler()

  const { mutate: oppdaterTilgangsforespørselstatus, isPending: oppdatererForespørselStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Tilgangsforespørselstatus }) =>
      rest.oppdaterTilgangsforespørselstatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_INNSENDTE_TILGANGSFORESPØRSLER] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_TILGANGER] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_DELBESTILLERROLLE] })
      window.scrollTo(0, 0)
    },
    onError: (error) => alert(error),
  })

  const avventerBehandling = (innsendteTilgangsforespørsler ?? []).filter(
    (f) => f.status === Tilgangsforespørselstatus.AVVENTER_BEHANDLING
  )

  return (
    <Box style={{ border: '2px dotted' }} padding="4">
      <Heading level="2" spacing size="small">
        Admin
      </Heading>

      {avventerBehandling.length === 0 ? (
        <BodyShort>Det er ingen tilgangsforespørsler som avventer behandling.</BodyShort>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Navn</Table.HeaderCell>
              <Table.HeaderCell>Organisasjon</Table.HeaderCell>
              <Table.HeaderCell>Handling</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {avventerBehandling.map((f) => (
              <Table.Row key={f.id}>
                <Table.DataCell>{f.id}</Table.DataCell>
                <Table.DataCell>{f.navn}</Table.DataCell>
                <Table.DataCell>{f.arbeidsforhold.organisasjon.navn}</Table.DataCell>
                <Table.DataCell>
                  <Button
                    onClick={() =>
                      oppdaterTilgangsforespørselstatus({ id: f.id, status: Tilgangsforespørselstatus.GODKJENT })
                    }
                    loading={oppdatererForespørselStatus}
                  >
                    Godkjenn
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      oppdaterTilgangsforespørselstatus({ id: f.id, status: Tilgangsforespørselstatus.AVSLÅTT })
                    }
                    loading={oppdatererForespørselStatus}
                  >
                    Avslå
                  </Button>
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
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

export default Tilgangsoversikt
