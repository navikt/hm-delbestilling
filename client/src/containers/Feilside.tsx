import { ErrorBoundary } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'

import { Button } from '@navikt/ds-react'

import { Avstand } from '../components/Avstand'
import { Feilmelding } from '../components/Feilmelding'
import Content from '../styledcomponents/Content'

interface Props {
  error: any
  resetErrorBoundary: ErrorBoundary['resetErrorBoundary']
}

const Feilside = ({ error, resetErrorBoundary }: Props) => {
  const { t } = useTranslation()
  return (
    <Content>
      <Avstand marginTop={4} marginBottom={4}>
        <Feilmelding feilmelding={{ feilmelding: t('feilside.noeGikkGalt'), tekniskFeilmelding: error }} />
        <Avstand marginTop={4} />
        <Button onClick={resetErrorBoundary}>{t('feilside.prøvPåNytt')}</Button>
      </Avstand>
    </Content>
  )
}

export default Feilside
