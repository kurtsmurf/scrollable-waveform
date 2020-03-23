const audioContext = new AudioContext()
const out = audioContext.createGain()
const comp = audioContext.createDynamicsCompressor()
const analyser = audioContext.createAnalyser()

out.connect(comp).connect(analyser).connect(audioContext.destination)

let audio

const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = 300


const c = canvas.getContext('2d')

const horizontalGuide = (y, isDashed) => {
  if (isDashed) {
    c.setLineDash([5, 15])
  }
  
  c.beginPath()
  c.moveTo(0, y)
  c.lineTo(canvas.width, y)
  c.stroke()

  c.setLineDash([])
}

const drawGuides = () => {
  horizontalGuide(0, false)
  horizontalGuide(canvas.height / 2, true)
  horizontalGuide(canvas.height, false)
}
drawGuides()

const drawWaveform = (offset = 0) => {
  const channel = audio.getChannelData(0)
  c.lineWidth = 10
  c.beginPath()
  c.moveTo(0, channel[offset])

  for (x=0;x<canvas.width;x++) {
    const amp = channel[x + offset]
    const overhead = canvas.height / 2
    const y = (amp * overhead) + overhead
    
    c.lineTo(x,y)
  }
  c.stroke()
  c.lineWidth = 1
}

const render = (offset) => {
  c.clearRect(0,0,canvas.width,canvas.height)
  drawGuides()
  drawWaveform(offset)
}

fetch('./resonator_clip.wav')
.then(response => response.arrayBuffer())
.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
.then(audioBuffer => {
  audio = audioBuffer
  drawWaveform()
})

let offset = 0;

window.onresize = () => {
  canvas.width = window.innerWidth
  render(offset)
}


canvas.addEventListener('mousewheel', (e) => {
  const shift = Math.floor(e.deltaY)
  const maxOffset = audio.length - canvas.width
  const minOffset = 0
  const shifted = offset + shift

  if (shifted < minOffset) {
    offset = minOffset
  } else if (shifted > maxOffset) {
    offset = maxOffset
  } else {
    offset = shifted
  }

  render(offset)
  e.preventDefault()
})
