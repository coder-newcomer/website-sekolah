// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang='en'>
        <head>
          <meta charset='utf-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/favicon.ico' />
          {/* PRELOAD */}
          <link rel='preload' as='style' href='/shoelace/cdn/themes/light.css' />
          <link rel='preload' as='script' href='/shoelace/cdn/shoelace-autoloader.js' />
          {/* IMPORT */}
          <link rel='stylesheet' href='/shoelace/cdn/themes/light.css' />
          <script type='module' src='/shoelace/cdn/shoelace-autoloader.js'></script>
          {assets}
        </head>
        <body>
          <div id='app'>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
