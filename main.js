let http = require('http')
let fs = require('fs')
let path = require('path')
let mime = require('mime')

path

let parsePath = p => {
  let ls = fs.readdirSync(p)
  ls = ls.map(n => {return {name:n}})
  ls = ls.map(ent => {ent.abs = path.join(p,ent.name);return ent})
  ls = ls.filter(ent => fs.statSync(ent.abs).isDirectory())
  ls = ls.map(ent => {ent.dir = fs.readdirSync(ent.abs);return ent})

  return ls
}

let returnJson = (json, httpRes)=> {
  httpRes.writeHead(200, {
    'Content-Type': 'text/json'
  })
  httpRes.end(JSON.stringify(json))
}

let server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    console.log('get: ',req.url)
    switch (req.url) {
      case '/update':
        //add api in here
        returnJson(parsePath('..'), res)
        break
      case '/':
        fs.readFile('index.html', (err, data) => {
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
        fs.readFile('html' + req.url, (err, data) => {
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
  }
})

let port = 80
let host = '127.0.0.1'
server.listen(port, host)
console.log('Listening at http://' + host + ':' + port)

console.log(parsePath('..'))
