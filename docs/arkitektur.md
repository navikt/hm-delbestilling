# Arkitektur og dataflyt

## Systemkontekst

```mermaid
flowchart LR
    tekniker["Tekniker"] --> app["hm-delbestilling<br/>React og Go-server"]
    app --> idp["ID-porten"]
    app --> roller["hm-roller"]
    app --> api["hm-delbestilling-api"]
    api --> roller
    api --> db[("PostgreSQL")]
    api --> kafka[("Kafka")]
    api --> oppslag["PDL, OeBS-proxy,<br/>grunndata og oppslagstjenester"]
    api --> msgraph["Microsoft Graph"]
    msgraph --> mottaker["Mottaker av e-post<br/>ved manuell behandling"]
    api --> slack["Slack-varsling"]
    kafka --> sink["hm-oebs-sink"]
    sink --> proxy["hm-oebs-api-proxy"]
    proxy --> oebs["OeBS"]
    oebs --> listener["hm-oebs-listener"]
    listener --> kafka
    kafka --> status["hm-soknadsbehandling"]
    status --> api
```

## Dataflyt og tillitsgrenser

```mermaid
flowchart LR
    subgraph ekstern["Bruker og eksterne tjenester"]
        browser["Tekniker i nettleser"]
        idporten["ID-porten"]
        msgraph["Microsoft Graph"]
        slack["Slack"]
        mottaker["E-postmottaker"]
    end

    subgraph nais["Nais prod-gcp: teamdigihot"]
        sidecar["ID-porten-sidecar"]
        bff["hm-delbestilling<br/>Go-server og React"]
        api["hm-delbestilling-api"]
        roller["hm-roller"]
        geo["digihot-oppslag"]
        sb["hm-soknadsbehandling"]
        sink["hm-oebs-sink"]
        listener["hm-oebs-listener"]
    end

    subgraph stores["Administrerte datalagre"]
        db[("PostgreSQL<br/>bestillinger og outbox")]
        kafka[("Kafka<br/>hm-soknadsbehandling-v1")]
    end

    subgraph deps["Andre tjenester"]
        pdl["PDL"]
        proxy["hm-oebs-api-proxy<br/>prod-fss"]
        oebs["OeBS"]
        grunndata["hm-grunndata-search"]
        norg["Norg"]
    end

    browser -->|"F1 HTTPS: innlogging og bestilling"| sidecar
    sidecar -->|"F2 innlogget forespørsel"| bff
    idporten <--> sidecar
    bff -->|"F3 API-kall: TokenX ved beskyttede ruter"| api
    bff -->|"F4 TokenX: rolleoppslag"| roller
    api -->|"F5 TokenX: rolleoppslag"| roller
    sb -->|"F6 Entra ID: statusoppdatering"| api
    api <--> |"F7 bestillinger, outbox"| db
    api -->|"F8 hendelser"| kafka
    api <--> |"F9 person og kommune"| pdl
    api <--> |"F10 utlån, person og lager"| proxy
    api <--> |"F11 produkt og deler"| grunndata
    api <--> |"F12 geografi"| geo
    api <--> |"F13 enhet"| norg
    api -->|"F14 e-post"| msgraph
    msgraph --> mottaker
    api -->|"F15 varsler"| slack
    kafka -->|"F16 bestillingshendelse"| sink
    sink -->|"F17 Entra ID: opprett ordre"| proxy
    proxy -->|"F18 Basic: ordre"| oebs
    oebs -->|"F19 bearer-token: status og ordrelinjer"| listener
    listener -->|"F20 status- og ordrelinjehendelser"| kafka
    kafka -->|"F21 status- og ordrelinjehendelser"| sb
```

`/public/` på Go-serveren videresendes til API-et uten `IDPTarget`; API-ets
produktoppslag er ikke lagt under autentiseringsblokkene. De øvrige brukerrutene
bruker TokenX og sjekker delbestillerrolle. Statusrutene bruker Entra ID.
Nais-konfigurasjonen begrenser også hvilke applikasjoner som kan kalle API-et.


## Produksjonsoppsett

```mermaid
flowchart TB
    user["Nettleser"] -->|"www.nav.no"| ingress["Nais ingress"]
    idp["ID-porten"] <--> sidecar
    subgraph gcp["prod-gcp / teamdigihot"]
        ingress --> sidecar["ID-porten-sidecar<br/>Level 4"]
        sidecar --> bff["hm-delbestilling<br/>Go-server og statisk React"]
        bff -->|"TokenX for beskyttede kall"| api["hm-delbestilling-api<br/>Ktor"]
        bff --> roller["hm-roller"]
        api --> roller
        sb["hm-soknadsbehandling"] -->|"Entra ID"| api
    end
    api --> db[("Cloud SQL PostgreSQL")]
    api --> kafka[("Kafka nav-prod")]
    api --> deps["Eksterne og øvrige interne tjenester"]
```

Produksjonskonfigurasjonen for frontend angir utgående tilgang til API-et,
`hm-roller` og Nav-dekoratøren. API-konfigurasjonen angir inngående tilgang fra
frontend og `hm-soknadsbehandling`. Se Nais-manifestene for fullstendige regler;
en tillatt nettverksforbindelse er ikke i seg selv autorisasjon.

## Innsending av bestilling

```mermaid
sequenceDiagram
    actor T as Tekniker
    participant B as hm-delbestilling
    participant A as hm-delbestilling-api
    participant R as hm-roller
    participant O as OeBS-proxy
    participant P as PDL
    participant D as PostgreSQL
    participant K as Kafka
    participant G as Microsoft Graph
    T->>B: Send bestilling etter innlogging
    B->>A: POST /api/delbestilling med TokenX
    A->>R: Hent og sjekk delbestillerrolle
    A->>O: Slå opp utlån og lager
    A->>P: Slå opp person og kommune
    Note over A: Sjekk blant annet rolle og geografisk tilknytning
    alt Automatisk behandling
        A->>D: Lagre bestilling og Kafka-outbox i samme transaksjon
        A-->>B: Resultat
        B-->>T: Resultat
        Note over A,D: Bakgrunnsjobb henter ventende outbox-meldinger
        A->>K: Publiser hm-OpprettDelbestilling
        A->>D: Marker publisert
    else Manuell behandling
        A->>D: Lagre bestilling og e-post-outbox i samme transaksjon
        A-->>B: Resultat
        B-->>T: Resultat
        Note over A,D: Bakgrunnsjobb henter ventende e-poster
        A->>G: Send e-post til lagerenhet
        A->>D: Marker sendt
    else Validering eller kontroll feiler
        A-->>B: Feilresultat
        B-->>T: Feilmelding
    end
```

Diagrammet forenkler rekkefølgen på oppslag og kontroller. Bakgrunnsjobbene kjører
uavhengig av HTTP-svaret, så publisering eller sending kan skje før eller etter at
svaret er mottatt. Outbox-jobbene forsøker på nytt ved feil. Hvis publisering eller sending lykkes,
men markering i databasen feiler, kan meldingen eller e-posten sendes på nytt.
Vellykket innsending er ikke det samme som bekreftet opprettelse i OeBS.

Videreføring av den automatiske bestillingen:

```mermaid
sequenceDiagram
    participant K as Kafka
    participant S as hm-oebs-sink
    participant P as hm-oebs-api-proxy
    participant O as OeBS
    K-->>S: hm-OpprettDelbestilling
    S->>P: POST /opprettOrdre med Entra ID
    P->>O: Opprett ordre med Basic-autentisering
```

## Status og skipningsbekreftelse

Listeneren publiserer hendelsene til Kafka. `hm-soknadsbehandling` konsumerer dem
og oppdaterer API-et.

```mermaid
sequenceDiagram
    participant O as OeBS
    participant L as hm-oebs-listener
    participant K as Kafka
    participant S as hm-soknadsbehandling
    participant A as hm-delbestilling-api
    participant D as PostgreSQL
    alt Ordrekvittering
        O->>L: POST /ordrekvittering med bearer-token
        L->>K: hm-ordrekvittering-delbestilling-mottatt
        K-->>S: Ordrekvittering
        S->>A: PUT /api/delbestilling/status/v2/{id}
        A->>D: Oppdater ordrestatus og ordrenummer
    else Skipningsbekreftelse for dellinje
        O->>L: POST /push med bearer-token
        L->>K: hm-uvalidert-ordrelinje
        K-->>S: Ordrelinje
        Note over S: Filtrer på hjelpemiddeltype Del
        S->>A: PUT /api/delbestilling/status/dellinje/{ordrenummer}
        A->>D: Oppdater kjent dellinje
        Note over A,D: Ukjent ordrenummer ignoreres
    end
    Note over S,A: Statusrutene bruker Entra ID
```

Listeneren publiserer uvaliderte ordrelinjer for mottakende system DIGIHOT;
`hm-soknadsbehandling` filtrerer på `hjelpemiddeltype == "Del"`. API-et
ignorerer ordrelinjer der ordrenummeret ikke tilhører en kjent delbestilling.

