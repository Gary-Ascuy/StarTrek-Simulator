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
          console.log(msj.id)

          if(msj.id != ID) {
            console.log("New ship, id:")
            console.log(msj.id)
            const batship = StarShip.create(galaxy, './assets/spaceship/batship.png', 'small batship', 200, 200, 45)
            ships[msj.id] = batship
            console.log(msj.id)
            client.publish('teamName/topic1', { type: "Existence notification", id: ID, x: ships[ID].x, y: ships[ID].y, angle: ships[ID].angle, sprite: SPRITEPATH })
          }
          break;
        case "Existence notification":
          if(msj.id != ID && !(msj.id in ships)) {
            console.log("A non default test")
            const batship = StarShip.create(galaxy, msj.sprite, 'small batship', 200, 200, 45)
            ships[msj.id] = batship
            ships[msj.id].setPosition(msj.x, msj.y)
            ships[msj.id].setAngle(msj.angle)
            console.log(msj.id)
            console.log(ships[msj.id])
          }
          break;
        case "Ship movement":
  /*         console.log("Someone just moved..")
          console.log(msj.id) */

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

      const bulletId = Date.now()
      const bullet = Bullet.create(galaxy, './assets/spaceship/bullet.png', 
      batship.getX(), batship.getY(), batship.getAngle(), bulletId)
      bullet.play()
      bullet.setState(1, 0)
    }
  })

  document.body.addEventListener('keyup', (e) => {
    if (go.indexOf(e.key) >= 0) batship.setState(0, batship.state.direction)
    if (direction.indexOf(e.key) >= 0) batship.setState(batship.state.go, 0)
  })

}

async function loadLogin(){
  document.getElementById('galaxy').style.display = "none"
  document.getElementById('formularies').style.display = "block"
}

async function loadGame(){
  document.getElementById('galaxy').style.display = "block"
  document.getElementById('formularies').style.display = "none"
  
  console.log('Starting Star Trek Simulator')
  galaxy = document.getElementById('galaxy')

  console.log('Connecting to RabbitMQ/MQTT over WebSocket')
  client = await connect(rabbitmqSettings)
  
  //console.log('Creating USS Enterprise element')
  //const enterprise = StarShip.create(galaxy, './assets/spaceship/ussenterprise.png', 'ussenterprise', 1, 1, 90)
  //enterprise.play()
  //enterprise.setState(1, 0) 


  const batship = StarShip.create(galaxy, SPRITEPATH, 'small batship', 200, 200, 45)
  batship.play()
  addKeyEvent(batship)

  ships[ID] = batship
  console.log(ships[ID]) 
}

function changeGameState(state){
  switch(state) {
    case "login":
      console.log("Changing to login configuration")
      loadLogin()
      break;
    case "game":
      console.log("Changing to game configuration")
      loadGame()
    }
}

function getFormInfo(){
  dataDict = {}
  const nickName = document.getElementById('nickName').value
  const genderIndex = document.getElementById('gender')
  const gender = genderIndex.options[genderIndex.selectedIndex].text;
  const starShipIndex = document.getElementById('starship')
  const starship = starShipIndex.options[starShipIndex.selectedIndex].text;
  const teamIndex = document.getElementById('team')
  const team = teamIndex.options[teamIndex.selectedIndex].text;
  dataDict["nickName"] = nickName
  dataDict["gender"] = gender
  dataDict["starship"] = starship
  dataDict["team"] = team
  return dataDict
}

function createRoom(){
  console.log('Generating room code')
  const roomCode = generateRandomMCode()
  console.log("Room code: " + roomCode)
  let dataDict = getFormInfo();

  // console.log('Creating a player object')
  // const player = Player.create(roomCode, dataDict["nickName"], dataDict["gender"], dataDict["starship"], dataDict["team"], "captain")

  changeGameState("game")
}

function joinRoom(){
  const roomCode = document.getElementById('code').value
  let dataDict = getFormInfo();

  // console.log('Creating a player object')
  // const player = Player.create(roomCode, dataDict["nickName"], dataDict["gender"], dataDict["starship"], dataDict["team"], "soldier")

  changeGameState("game")
}

async function main() {
  console.log('Welcome to our Star Trek Simulator!')
  document.getElementById('formularies').style.display = "none"
  document.getElementById('galaxy').style.display = "none"
  changeGameState("login")
}
