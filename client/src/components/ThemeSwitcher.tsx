import { ThemeIcon } from '@navikt/aksel-icons'
import { Button, Tooltip } from '@navikt/ds-react'

import { LOCALSTORAGE_KEY_THEME, ThemeType, useThemeContext } from '../theme/ThemeContext'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeContext()

  return (
    <Tooltip content={theme === ThemeType.DARK ? 'Endre til lyst tema' : 'Endre til mørkt tema'}>
      <Button
        variant="tertiary"
        icon={<ThemeIcon aria-hidden />}
        onClick={() => {
          const valgtTema = theme === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK
          setTheme(valgtTema)
          localStorage.setItem(LOCALSTORAGE_KEY_THEME, valgtTema)
        }}
      />
    </Tooltip>
  )
}

export default ThemeSwitcher
