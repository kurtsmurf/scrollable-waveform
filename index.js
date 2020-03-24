const audioContext = new AudioContext()
const out = audioContext.createGain()
const comp = audioContext.createDynamicsCompressor()
const analyser = audioContext.createAnalyser()

out.connect(comp).connect(analyser).connect(audioContext.destination)

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const drawWaveform = (offset = 0) => {
  const channelL = audio.getChannelData(0)
  
  c.lineWidth = 10
  c.beginPath()

  for (x=0;x<canvas.width;x+=1) {
    const amp = channelL[x + offset]
    const overhead = 150
    const y = (amp * overhead) + canvas.height - overhead
    
    c.lineTo(x,y)
  }

  c.stroke()
}

let imageData;

const render = (offset) => {

  // dump canvas contents to image
  imageData = c.getImageData(0,0,canvas.width,canvas.height)
  
  // clear canvas
  c.clearRect(0,0,canvas.width,canvas.height)

  // copy image back into canvas shifted up
  c.putImageData(imageData,0,-5)

  // overlay a transparent color
  c.fillStyle = 'rgba(255,255,255,0.01)'
  c.fillRect(0,0,canvas.width,canvas.height)
  c.fillStyle = 'black'

  // draw the updated waveform
  drawWaveform(offset)
}

let audio

fetch('./resonator_clip.wav')
.then(response => response.arrayBuffer())
.then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
.then(audioBuffer => {
  audio = audioBuffer
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  render(0)
})

let offset = 0;

window.onresize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
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
