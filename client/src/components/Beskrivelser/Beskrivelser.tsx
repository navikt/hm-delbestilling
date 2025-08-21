import React from 'react'

import styles from './Beskrivelser.module.css'

interface BeskrivelsesProps {
  children: React.ReactNode
  className?: string
}

export const Beskrivelser: React.FC<BeskrivelsesProps> = ({ children, className }) => {
  return <div className={`${styles.beskrivelser} ${className || ''}`}>{children}</div>
}
