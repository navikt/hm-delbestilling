import React from 'react'

import styles from './DelInhold.module.css'

interface DelInnholdProps {
  children: React.ReactNode
  className?: string
}

const DelInnhold: React.FC<DelInnholdProps> = ({ children, className }) => {
  return <div className={`${styles.delInnhold} ${className || ''}`}>{children}</div>
}

export default DelInnhold
