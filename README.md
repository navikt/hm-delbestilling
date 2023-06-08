# hm-delbestilling

Frontend-applikasjon for bestilling av deler fra teknikere

## Testguide

| artnr  | serienr | resultat ved oppslag          | resultat ved innsending                  |
| ------ | ------- | ----------------------------- | ---------------------------------------- |
| 222222 | 111111  | Returnerer hjelpemiddel       | Gyldig innsending                        |
| 000000 | 000000  | Tilbyr ikke deler til produkt | N/A                                      |
| 333333 | 000000  | Inget utlån på bruker         | N/A                                      |
| 222222 | 999999  | N/A                           | Bruker ikke funnet                       |
| 222222 | 222222  | N/A                           | Innsender prøver å bestille til seg selv |
