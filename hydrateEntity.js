const fs = require('fs');
const path = require('path');
const git = require('simple-git');

const extractGitURL = res => (err, val) => {
  return err ? res([['gitUrl', err]]) : res([['gitUrl', val]]);
};

const promisedGitUrl = path => new Promise((res, rej) => {
  git(path).listRemote(['--get-url'], extractGitURL(res))
});

const promisedGitLog = path => new Promise((res,rej)=>{
  let ret = (err, val) => {
    if (!err) {
      //turn date into linuxtime
      val.latest.date = new Date(val.latest.date).getTime()
      res([['gitLog',val.latest],['date',val.latest.date]])
    } else {
      res([['gitLog',err]])
    }
  }
  git(path).log({},ret)
});

const shuffle = ent => a => {
  a.forEach(ar => ar.forEach(el => ent[el[0]]=el[1]))
  return ent
}

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
    let rebuildEnt = Promise.all([promisedGitUrl(ent.path), promisedGitLog(ent.path)])
      .then(shuffle(ent))
    return rebuildEnt
  } else {
    return ent
  }
}

module.exports = hydrateEntity;