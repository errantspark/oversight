let http = require('http')
let fs = require('fs')
let path = require('path')
let mime = require('mime')
let hydrateEntity = require('./hydrateEntity.js')

let parsePath = p => {
  let ls = fs.readdirSync(p)
    .map(name => ({name, path: path.join(p, name)}))
    .filter(({path}) => fs.statSync(path).isDirectory())
    .map(hydrateEntity)
  return ls
}

const returnJson = (json, httpRes) => {
  httpRes.writeHead(200, {'Content-Type': 'text/json'})
  httpRes.end(JSON.stringify(json))
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') return;
  
  console.log('get: ',req.url)
  switch (req.url) {
    case '/update':
      Promise.all(parsePath('..'))
        .then(x => returnJson(x,res))
        .catch(console.log)
      break
    case '/':
      fs.readFile('www/index.html', (err, data) => {
        if (err) {
          res.writeHead(404)
          res.end()
        } else {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          })
          res.end(data)
        }
      })
      break
    default:
      fs.readFile('www'+req.url, (err, data) => {
        if (err) {
          res.writeHead(404)
          res.end()
        } else {
          res.writeHead(200, {
            'Content-Type': mime.lookup(req.url)
          })
          res.end(data)
        }
      })
      break
  }

})

let port = 8080
let host = '127.0.0.1'
server.listen(port, host)
console.log('Listening at http://' + host + ':' + port)
