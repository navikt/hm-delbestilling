import React from 'react'

import styles from './FlexedStack.module.css'

interface FlexedStackProps {
  children: React.ReactNode
  className?: string
}

const FlexedStack: React.FC<FlexedStackProps> = ({ children, className }) => {
  return <div className={`${styles.flexedStack} ${className || ''}`}>{children}</div>
}

export default FlexedStack
