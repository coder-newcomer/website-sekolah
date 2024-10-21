/** PLAIN SERVER */

import { App } from '@sifrr/server'

const port = 3000

const app = new App()

app
  .get('/*', (res, req) => {
    res.end('Hello World!')
  })
  .listen(port, (token) => {
    if (token) {
      console.log('Listening at http://localhost:' + port)
    } else {
      console.log('Failed listening at http://localhost:' + port)
    }
  })
