/** PLAIN SERVER */

import { App } from '@sifrr/server'

const port = 3000
const host = '0.0.0.0'

const app = new App()

app
  .get('/*', (res, req) => {
    res.end('Hello World!')
  })
  .listen(host, port, (token) => {
    if (token) {
      console.log(`Listening at http://${host}:${port}`)
    } else {
      console.log(`Failed listening at http://${host}:${port}`)
    }
  })
