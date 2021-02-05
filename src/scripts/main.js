const room = "001";
let idGamer = ""

const rabbitmqSettings = {
  username: 'admin',
  password: 'admin',
  host: 'http://localhost/',
  keepalive: 20,
  path: 'ws'
}

async function connect(options) {
  try {
    const client = await RsupMQTT.connect(options)
    client.subscribe('dragonite/' + room).on(message => console.log(message.string))
    client.publish('dragonite/' + room, 'Room '+ room)
  } catch (error) {
    console.log(error)
  }

}

function addKeyEvent(batship) {
  const up = ['w', 'ArrowUp']
  const down = ['s', 'ArrowDown']
  const left = ['a', 'ArrowLeft']
  const right = ['d', 'ArrowRight']
  const go = [...up, ...down]
  const direction = [...left, ...right]
  const stop = ['c', 'x']
  const space = [' ']

  document.body.addEventListener('keydown', (e) => {
    if (up.indexOf(e.key) >= 0) batship.setState(1, batship.state.direction)
    if (down.indexOf(e.key) >= 0) batship.setState(-1, batship.state.direction)
    if (left.indexOf(e.key) >= 0) batship.setState(batship.state.go, -1)
    if (right.indexOf(e.key) >= 0) batship.setState(batship.state.go, 1)

    if (stop.indexOf(e.key) >= 0) batship.setState(0, 0)

    if (space.indexOf(e.key) >= 0) {
      const bullet = Bullet.create(galaxy, './assets/spaceship/bullet.png', batship.getX(), batship.getY(), batship.getAngle())
      bullet.play()
      bullet.setState(1, 0)
    }
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
  const enterprise = StarShip.create(galaxy, './assets/spaceship/ussenterprise.png', 'ussenterprise', 1, 1, 90)
  enterprise.play()
  enterprise.setState(1, 0) 

  const batship = StarShip.create(galaxy, './assets/spaceship/batship.png', 'small batship', 80, 300, 45)
  batship.play()
  addKeyEvent(batship)

  console.log('Connecting to RabbitMQ/MQTT over WebSocket')
  await connect(rabbitmqSettings)
}
