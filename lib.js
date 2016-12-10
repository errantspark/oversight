let rescale = (min, max) => s => (s-min)/(max-min)
let getMeta = projects => {
  let meta = {}
  let dates = projects.map(x => x.date)
  meta.newest = Math.max(...dates)
  meta.oldest = Math.min(...dates)
  return meta
} 
