let http = require('http')
let fs = require('fs')
let path = require('path')
let asyn = require('async')
let mime = require('mime')
let git = require('simple-git')

let callbacks

let parsePath = (p,cb) => {
  let ls = fs.readdirSync(p)
    .map(n => {
      let ent = {name:n}
      ent.path = path.join(p,ent.name)
      return ent
    })
    .filter(ent => fs.statSync(ent.path).isDirectory())
    .map(ent => {
      ent.dir = fs.readdirSync(ent.path)
      if (ent.hasPlan = ent.dir.find(x => x === 'plan.md')?true:false){
        ent.planPath = path.join(ent.path,'plan.md')
        ent.plan = fs.readFileSync(ent.planPath).toString()
      }
      ent.hasGit = ent.dir.find(x => x === '.git')?true:false
      console.log(ent.name, ent.hasGit)
      //let callback = (ent => (...res) => {
      //  var ent.gitLog = res
      //})(ent)
      //git(ent.path).log({},callback)
      return ent
    }
    )
  console.log(ls)
  let acb = (ent, callback) => {
    let cbm = (ent => (err, v) => {
      if (!err){
        ent.gitLog = v.latest
        callback(null, ent)
      } else {
        ent.gitLog = err
        callback(null, ent)
      }
    })(ent)
    if (ent.hasGit) {
      git(ent.path).log({},cbm)
    } else {
      callback(null, ent)
    }
  }
  asyn.map(ls, acb, cb)
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
        parsePath('..', (err, ret) => returnJson(ret, res))
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

let port = 8080
let host = '127.0.0.1'
server.listen(port, host)
console.log('Listening at http://' + host + ':' + port)

