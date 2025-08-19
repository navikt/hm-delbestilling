import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle<{ mainBg?: string }>`
  main {
    background: ${(props) => (props.mainBg ? props.mainBg : 'var(--a-gray-50)')};
    padding: 2rem 0 12rem 0;
  }
`
