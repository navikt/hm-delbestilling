import { render } from 'mustache'
import { defineConfig, Plugin, splitVendorChunkPlugin } from 'vite'
import svgr from 'vite-plugin-svgr'

import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr'
import react from '@vitejs/plugin-react'

const htmlPlugin = ({ development }: { development?: boolean }): Plugin => ({
  name: 'html-transform',
  async transformIndexHtml(html) {
    if (development) {
      const decorator = await fetchDecoratorHtml({
        env: 'dev',
        params: {
          context: 'samarbeidspartner',
          logoutWarning: true,
        },
      })
      return {
        html: render(html, decorator),
        tags: [
          {
            tag: 'script',
            children: `window.appSettings = {
              GIT_COMMIT: 'ukjent',
              MILJO: 'dev-gcp',
              USE_MSW: true,
            }`,
          },
        ],
      }
    } else {
      return {
        html,
        tags: [
          {
            tag: 'script',
            children: `window.appSettings = {}`,
          },
          {
            tag: 'script',
            attrs: {
              src: '/hjelpemidler/delbestilling/settings.js',
            },
          },
        ],
      }
    }
  },
})

// https://vitejs.dev/config/
export default defineConfig((env) => ({
  base: '/hjelpemidler/delbestilling/',
  plugins: [htmlPlugin({ development: env.mode === 'development' }), react(), svgr(), splitVendorChunkPlugin()],
  build: {
    sourcemap: true,
    manifest: true,
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
  },
}))
