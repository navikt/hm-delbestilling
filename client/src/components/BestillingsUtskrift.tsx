import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import styled from 'styled-components'

const PrintWrap = styled.div`
  display: none;
  @media print {
    display: block;
  }
`

const BestillingsUtskrift = () => {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => {
      // setVisBestillingsUtskrift(true)
      // logPrintKvitteringÅpnet()
    },
    // onAfterPrint: () => setVisBestillingsUtskrift(false),
    // documentTitle: `kvittering_delbestilling_${state?.saksnummer}`,
  })

  return <PrintWrap ref={printRef}>BestillingsUtskrift</PrintWrap>
}

export default BestillingsUtskrift
