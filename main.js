let http = require('http')
let fs = require('fs')
let path = require('path')
let mime = require('mime')
let git = require('simple-git')

let parsePath = p => {
  let ls = fs.readdirSync(p)
    .map(n => {
      let ent = {name:n}
      ent.path = path.join(p,ent.name)
      return ent
    })
    .filter(ent => fs.statSync(ent.path).isDirectory())
    .map(ent => {
      ent.dir = fs.readdirSync(ent.path)
      ent.stat = fs.statSync(ent.path)
      ent.date = new Date(ent.stat.mtime).getTime()
      if (ent.hasPlan = ent.dir.find(x => x === 'plan.md')?true:false){
        ent.planPath = path.join(ent.path,'plan.md')
        ent.plan = fs.readFileSync(ent.planPath).toString()
      }
      ent.hasGit = ent.dir.find(x => x === '.git')?true:false
      if (ent.hasGit) {
        //deal with all git stuff using promises
        let gitLog = new Promise((res,rej)=>{
          let ret = (err,val) => {
            if (!err) {
              //turn date into linuxtime
              val.latest.date = new Date(val.latest.date).getTime()
              res([['gitLog',val.latest],['date',val.latest.date]])
            } else {
              res([['gitLog',err]])
            }
          }
          git(ent.path).log({},ret)
        })
        let gitUrl = new Promise((res,rej)=>{
          let ret = (err,val) => {
            if (!err) {
              res([['gitUrl',val]])
            } else {
              res([['gitUrl',err]])
            }
          }
          git(ent.path).listRemote(['--get-url'],ret)
        })
        let rebuildEnt = Promise.all([gitUrl,gitLog]).then(a=>{
          a.forEach(ar => {
            ar.forEach(el => ent[el[0]]=el[1])
          })
          return ent
        })
        return rebuildEnt
      } else {
        return ent
      }
    })
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
        let ret = x => returnJson(x,res)
        let dir = parsePath('..')
        Promise.all(dir).then(ret).catch(console.log)
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
        fs.readFile('.'+req.url, (err, data) => {
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
