const SALA = "temp"
const ID = "1"
const NICKNAME = "SHA"
const GENDER = "M"
const SPRITEPATH = './assets/spaceship/batship.png'
const TEAM = "1"

let galaxy = {}

let ships = {}

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
    let test = "";
    const client = await RsupMQTT.connect(options)
    client.subscribe('teamName/topic1').on(message => {

      const msj = JSON.parse(message.string)
      
      switch(msj.type) {
        case "arrival":
          console.log("A new contender has just arrived!!!!")

          if(msj.id != ID) {
            console.log("New ship, id:")
            console.log(msj.id)
            const batship = StarShip.createShip(galaxy, './assets/spaceship/batship.png', 'small batship', 200, 200, 45)
            ships[msj.id] = batship
            console.log(msj.id)
            client.publish('teamName/topic1', { type: "Existence notification", id: ID, x: ships[ID].x, y: ships[ID].y, angle: ships[ID].angle, sprite: SPRITEPATH })
          }
          break;
        case "Existence notification":
          if(msj.id != ID && !(msj.id in ships)) {
            console.log("A non default test")
            const batship = StarShip.createShip(galaxy, msj.sprite, 'small batship', 200, 200, 45)
            ships[msj.id] = batship
            ships[msj.id].setPosition(msj.x, msj.y)
            ships[msj.id].setAngle(msj.angle)
            console.log(msj.id)
            console.log(ships[msj.id])
          }
          break;
        case "Ship movement":
          console.log("Someone just moved..")
          console.log(msj.id)

          if(msj.id != ID) {
            ships[msj.id].setPosition(msj.x, msj.y)
            ships[msj.id].setAngle(msj.angle)
          }
          break;
          
        default:
          console.log("A default test")
      }
    })
    client.publish('teamName/topic1', { type: "arrival", id: ID })
    return client
  } catch (error) {
    console.log(error)
  }
}

class StarShip {
  constructor(el, x = 0, y = 0, angle = 0, client) {
    this.el = el
    this.client = client

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

      ships[ID].setPosition(x, y)
      ships[ID].setAngle(angle)

      client.publish('teamName/topic1', { type: "Ship movement", id: ID, x: x, y: y, angle: angle })
    }, 30)
  }

  stop() {
    clearInterval(this.timer)
  }

  static createShip(parent, imagePath, extraClass, x = 0, y = 0, angle = 0) {
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
  //const galaxy = document.getElementById('galaxy')
  galaxy = document.getElementById('galaxy')

  console.log('Connecting to RabbitMQ/MQTT over WebSocket')
  client = await connect(rabbitmqSettings)

  //console.log('Creating USS Enterprise element')
  //const enterprise = StarShip.createFirstShip(galaxy, './assets/spaceship/ussenterprise.png', 'ussenterprise', 0, 0, 90, client)
  //enterprise.play()
  //enterprise.setPosition(57, 0)
  //enterprise.setAngle(50)

  const batship = StarShip.createShip(galaxy, SPRITEPATH, 'small batship', 200, 200, 45)
  batship.play()
  addKeyEvent(batship)

  ships[ID] = batship
  console.log(ships[ID])
  
}
