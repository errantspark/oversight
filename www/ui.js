let rescale = (min, max) => s => (s-min)/(max-min)
let getMeta = projects => {
  let meta = {}
  let dates = projects.map(x => x.date)
  meta.newest = Math.max(...dates)
  meta.oldest = Math.min(...dates)
  return meta
} 
let httpGet = url => {
  var xmlHttp = new XMLHttpRequest()
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null )
  return xmlHttp.responseText
}

let spect = chroma.scale('Spectral')
let projects = JSON.parse(httpGet('/update'))
projects = projects.filter(proj => !proj.hasGit || proj.gitUrl.match(/errantspark/))
let meta = getMeta(projects)
let timeToF = rescale(meta.oldest,meta.newest)

projects.sort((a,b) => b.date - a.date)
projects.forEach(p => {
  let container = document.getElementById('container')
  let d = document.createElement('div')

  d.classList.add('project')
  d.style.background = spect(1-timeToF(p.date)).hex()
  let textWrap = document.createElement('div')
  textWrap.classList.add('text-wrapper')
  textWrap.style.width = 4+p.name.length*0.3+'em'
  let title = document.createElement('span')
  title.classList.add('title')
  title.innerHTML = p.name+'<br>'
  textWrap.appendChild(title)
  let log = document.createElement('span')
  log.classList.add('log')
  if (p.hasGit && p.gitLog && p.gitLog.message) {
    log.innerHTML = p.gitLog.message.match(/(.*) \(/)[1]   
  }
  textWrap.appendChild(log)
  d.appendChild(textWrap)

  container.appendChild(d)
})
