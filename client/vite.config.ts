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
      const {
        DECORATOR_HEAD_ASSETS: HeadAssets,
        DECORATOR_HEADER: Header,
        DECORATOR_FOOTER: Footer,
        DECORATOR_SCRIPTS: Scripts,
      } = decorator
      return {
        html: render(html.replace(/\{\{\./g, '{{{').replace(/\}\}/g, '}}}'), {
          HeadAssets,
          Header,
          Footer,
          Scripts,
        }),
        tags: [
          {
            tag: 'script',
            children: `window.appSettings = {
              GIT_COMMIT: 'ukjent',
              NAIS_CLUSTER_NAME: 'dev-gcp',
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
    proxy: {
      '/hjelpemidler/delbestilling/api/oppslag-ekstern-dev': {
        target: 'https://hjelpemidler.ekstern.dev.nav.no',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hjelpemidler\/delbestilling/, ''),
      },
    },
  },
}))
