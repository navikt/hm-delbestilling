import React from 'react'

import styles from '../../styles/Content.module.css'

interface ContentProps {
  children: React.ReactNode
  className?: string
}

const Content: React.FC<ContentProps> = ({ children, className }) => {
  return <div className={`${styles.content} ${className || ''}`}>{children}</div>
}

export default Content
