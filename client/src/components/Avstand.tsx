import type { ReactNode } from 'react'
import React from 'react'
import styled from 'styled-components'

export interface AvstandProps {
  children?: ReactNode | undefined
  margin?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  centered?: boolean
  style?: React.CSSProperties
}

export function Avstand(props: AvstandProps) {
  const { children, ...rest } = props
  return (
    <Box aria-hidden={!children} {...rest}>
      {children}
    </Box>
  )
}

type MarginProps = Omit<AvstandProps, 'children'>

const Box = styled('div')
  .withConfig({
    shouldForwardProp: (prop) =>
      ![
        'margin',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'padding',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'centered',
      ].includes(prop),
  })
  .attrs({ className: 'foo' })`
  ${spacer}
  ${(props: MarginProps) => ({ textAlign: props.centered ? 'center' : 'unset' })}
`

function spacer(props: MarginProps) {
  return {
    margin: props.margin,
    'margin-top': spacingVar(props.marginTop),
    'margin-right': spacingVar(props.marginRight),
    'margin-bottom': spacingVar(props.marginBottom),
    'margin-left': spacingVar(props.marginLeft),
    padding: props.padding,
    'padding-top': spacingVar(props.paddingTop),
    'padding-right': spacingVar(props.paddingRight),
    'padding-bottom': spacingVar(props.paddingBottom),
    'padding-left': spacingVar(props.paddingLeft),
  }
}

function spacingVar(space?: number): string | undefined {
  return typeof space === 'number' ? `var(--a-spacing-${space})` : undefined
}
