const fs = require('fs');
const path = require('path');
const git = require('simple-git');

const hydrateEntity = ent => {
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
      let ret = (err, val) => {
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
}

module.exports = hydrateEntity;