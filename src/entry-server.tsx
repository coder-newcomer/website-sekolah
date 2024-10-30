// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'
import '@shoelace-style/shoelace/dist/themes/light.css'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang='en'>
        <head>
          <meta charset='utf-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/karnas.jpg' />
          {/* Tabler Icons */}
          <link
            rel='stylesheet'
            href='https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css'
          />
          {/* Shoelace */}
          <link
            rel='stylesheet'
            href='https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@latest/cdn/themes/light.css'
          />
          {assets}
        </head>
        <body>
          <div id='app'>{children}</div>
          {scripts}
          <script
            type='module'
            src='https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@latest/cdn/shoelace-autoloader.js'></script>
        </body>
      </html>
    )}
  />
))
