let rescale = (min, max) => s => (s-min)/(max-min)
let getMeta = projects => {
  let meta = {}
  let dates = projects.map(x => {
    if (x.hasGit && x.gitLog.date) {
      return x.gitLog.date
    }
  }).filter(x => x)
  meta.newest = Math.max(...dates)
  meta.oldest = Math.min(...dates)
  return meta
} 
