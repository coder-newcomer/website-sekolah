/* Minimal SSL/non-SSL example */

import uWS from 'uWebSockets.js/src/uws'
const port = 9001

const app = uWS.App()
  .get('/*', (res, req) => {
    res.end('Hello World!')
  })
  .listen(port, (token) => {
    if (token) {
      console.log('Listening to port ' + port)
    } else {
      console.log('Failed to listen to port ' + port)
    }
  })
