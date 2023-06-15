# hm-delbestilling

Frontend-applikasjon for bestilling av deler fra teknikere

## Testguide

| artnr  | serienr | resultat ved oppslag          | resultat ved innsending                                |
| ------ | ------- | ----------------------------- | ------------------------------------------------------ |
| 222222 | 333333  | Returnerer hjelpemiddel       | Gyldig innsending                                      |
| 000000 | 000000  | Tilbyr ikke deler til produkt | N/A                                                    |
| 333333 | 000000  | Inget utlån på bruker         | N/A                                                    |
| 222222 | 000000  | Returnerer hjelpemiddel       | Bruker ikke funnet                                     |
| 222222 | 111111  | Returnerer hjelpemiddel       | Innsender prøver å bestille til seg selv               |
| 222222 | 444444  | Returnerer hjelpemiddel       | Ulik geografisk tilknytning                            |
| 222222 | 555555  | Returnerer hjelpemiddel       | Kan ikke bestille                                      |
| 222222 | 666666  | Returnerer hjelpemiddel       | Kan ikke bestille pga for mange bestillinger siste 24t |
