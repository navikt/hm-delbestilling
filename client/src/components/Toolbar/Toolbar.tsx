import { HStack } from '@navikt/ds-react'

import ThemeSwitcher from '../ThemeSwitcher'

import styles from './Toolbar.module.css'

const Toolbar = () => {
  return (
    <div className={styles.toolbar}>
      <HStack justify="end">
        <ThemeSwitcher />
      </HStack>
    </div>
  )
}

export default Toolbar
