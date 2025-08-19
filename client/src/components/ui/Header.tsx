import React from 'react'

import styles from '../../styles/Header.module.css'

interface HeaderProps {
  children: React.ReactNode
  className?: string
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return <header className={`${styles.header} ${className || ''}`}>{children}</header>
}

export default Header
