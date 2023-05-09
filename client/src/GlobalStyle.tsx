import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle<{ grey?: boolean }>`
  body {
    background: ${(props) => (props.grey ? '#EFEFEF' : 'white')}
  }

  main {
    margin-bottom: 2rem;
  }

`
