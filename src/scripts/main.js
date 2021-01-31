const rabbitmqSettings = {
  username: 'admin',
  password: 'admin',
  host: 'frontend.ascuy.me',
  port: 15675,
  keepalive: 20,
  path: 'ws'
}

async function connect(options) {
  try {
    const client = await RsupMQTT.connect(options)
    client.subscribe('teamName/topic').on(message => console.log(message.string))
    client.publish('teamName/topic', 'Hello MQTT')
  } catch (error) {
    console.log(error)
  }
}

class StarShip {
  constructor(el, x = 0, y = 0, angle = 0) {
    this.el = el

    this.setState()
    this.setAngle(angle)
    this.setPosition(x, y)
    this.setVisibility(true)
  }

  setState(go = 0, direction = 0) {
    this.state = { go, direction }
  }

  setAngle(angle) {
    this.angle = angle
    this.el.style.transform = `rotate(${angle}deg)`
  }

  setPosition(x, y) {
    this.x = x
    this.y = y

    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`
  }

  setVisibility(visible) {
    this.el.style.visibility = visible ? 'visible' : 'hidden'
  }

  play() {
    this.timer = setInterval(()=> {
      const { go, direction } = this.state  
      if (go === 0 && direction === 0) return;

      const angle = (this.angle + direction) % 360
      const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go
      const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go
  
      this.setPosition(x, y)
      this.setAngle(angle)
    }, 30)
  }

  stop() {
    clearInterval(this.timer)
  }

  static create(parent, imagePath, extraClass, x = 0, y = 0, angle = 0) {
    const img = document.createElement('img')
    img.className = `starship ${extraClass}`
    img.src = imagePath
    parent.appendChild(img)

    return new StarShip(img, x, y, angle)
  }
}

function addKeyEvent(batship) {
  const up = ['w', 'ArrowUp']
  const down = ['s', 'ArrowDown']
  const left = ['a', 'ArrowLeft']
  const right = ['d', 'ArrowRight']
  const go = [...up, ...down]
  const direction = [...left, ...right]
  const stop = [' ', 'c', 'x']

  document.body.addEventListener('keydown', (e) => {
    if (up.indexOf(e.key) >= 0) batship.setState(1, batship.state.direction)
    if (down.indexOf(e.key) >= 0) batship.setState(-1, batship.state.direction)
    if (left.indexOf(e.key) >= 0) batship.setState(batship.state.go, -1)
    if (right.indexOf(e.key) >= 0) batship.setState(batship.state.go, 1)

    if (stop.indexOf(e.key) >= 0) batship.setState(0, 0)
  })

  document.body.addEventListener('keyup', (e) => {
    if (go.indexOf(e.key) >= 0) batship.setState(0, batship.state.direction)
    if (direction.indexOf(e.key) >= 0) batship.setState(batship.state.go, 0)
  })
}

async function main() {
  console.log('Starting Star Trek Simulator')
  const galaxy = document.getElementById('galaxy')

  console.log('Creating USS Enterprise element')
  const enterprise = StarShip.create(galaxy, './assets/spaceship/ussenterprise.png', 'ussenterprise', 0, 0, 90)
  enterprise.play()
  enterprise.setState(1, 0)

  const batship = StarShip.create(galaxy, './assets/spaceship/batship.png', 'small batship', 200, 200, 45)
  batship.play()
  addKeyEvent(batship)

  console.log('Connecting to RabbitMQ/MQTT over WebSocket')
  await connect(rabbitmqSettings)
}
