import { createContext, PropsWithChildren, useContext, useState } from 'react'

import { Theme } from '@navikt/ds-react'

export const LOCALSTORAGE_KEY_THEME = 'hm-delbestilling-theme'

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
}

type ThemeContextType = {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeType.LIGHT,
  setTheme: (theme: ThemeType) => {},
})

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const localStorageTheme = localStorage.getItem(LOCALSTORAGE_KEY_THEME) as ThemeType | null
  const [theme, setTheme] = useState(localStorageTheme || ThemeType.LIGHT)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Theme theme={theme}>{children}</Theme>
    </ThemeContext.Provider>
  )
}

const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext må være i scope av: ThemeProvider')
  }

  return context
}

export { ThemeContext, ThemeProvider, useThemeContext }
