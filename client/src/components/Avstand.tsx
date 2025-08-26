import type { ReactNode } from 'react'

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
  const { children, style, centered, ...spacingProps } = props

  const spacingStyle: React.CSSProperties = {
    ...getSpacingStyle(spacingProps),
    textAlign: centered ? 'center' : 'unset',
    ...style,
  }

  return (
    <div aria-hidden={!children} style={spacingStyle}>
      {children}
    </div>
  )
}

type SpacingProps = Omit<AvstandProps, 'children' | 'centered' | 'style'>

function getSpacingStyle(props: SpacingProps): React.CSSProperties {
  return {
    margin: spacingVar(props.margin),
    marginTop: spacingVar(props.marginTop),
    marginRight: spacingVar(props.marginRight),
    marginBottom: spacingVar(props.marginBottom),
    marginLeft: spacingVar(props.marginLeft),
    padding: spacingVar(props.padding),
    paddingTop: spacingVar(props.paddingTop),
    paddingRight: spacingVar(props.paddingRight),
    paddingBottom: spacingVar(props.paddingBottom),
    paddingLeft: spacingVar(props.paddingLeft),
  }
}

function spacingVar(space?: number): string | undefined {
  return typeof space === 'number' ? `var(--a-spacing-${space})` : undefined
}
