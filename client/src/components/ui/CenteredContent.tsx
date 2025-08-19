import React from 'react'

import styles from '../../styles/CenteredContent.module.css'

interface CenteredContentProps {
  children: React.ReactNode
  className?: string
}

export const CenteredContent: React.FC<CenteredContentProps> = ({ children, className }) => {
  return <div className={`${styles.centeredContent} ${className || ''}`}>{children}</div>
}
