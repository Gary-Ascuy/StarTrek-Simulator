const rabbitmqSettings = {
  username: 'admin',
  password: 'admin',
  host: 'frontend.ascuy.me',
  port: 15675,
  keepalive: 20,
  path: 'ws'
}

let client = null
let room = null
let player = null
let starShip = null
let otherShips = []

async function connect(options) {
  try {
    client = await RsupMQTT.connect(options)
    player.id = client.clientId
    client.subscribe('raichu/'+room.id+'/informNewPosition').on(addNewShip )
    client.subscribe('raichu/'+room.id+'/informPositionOld').on(getOldShips )
    client.subscribe('raichu/'+room.id+'/positions').on(changePosition)

    client.publish('raichu/'+room.id+'/informNewPosition', player)
    
  } catch (error) {
    console.log(error)
  }
}

function getOldShips(dataIn){
  var data = JSON.parse(dataIn.string)
  if(player.id===data.newShip){
    paintOtherShip(data.player)
  }
  
}

function addNewShip(dataIn){
  var data = JSON.parse(dataIn.string)
  if(player.id !== data.id){
    paintOtherShip(data)
    client.publish('raichu/'+room.id+'/informPositionOld',{newShip:data.id, player})
  }
  
}

function changePosition(dataIn){

  var data = JSON.parse(dataIn.string)
  
  if( otherShips[data.starShip_id] !== undefined && otherShips[data.starShip_id] !== null){
    otherShips[data.starShip_id].setPosition(data.x, data.y);
    otherShips[data.starShip_id].setAngle(data.angle);
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

  let data = { x : starShip.x,
    y : starShip.y,
    angle : starShip.angle,
    starShip_id : player.id}

  document.body.addEventListener('keydown', (e) => {
    if (up.indexOf(e.key) >= 0) batship.setState(1, batship.state.direction)
    if (down.indexOf(e.key) >= 0) batship.setState(-1, batship.state.direction)
    if (left.indexOf(e.key) >= 0) batship.setState(batship.state.go, -1)
    if (right.indexOf(e.key) >= 0) batship.setState(batship.state.go, 1)

    if (stop.indexOf(e.key) >= 0) batship.setState(0, 0)

    client.publish('raichu/'+room.id+'/positions', data)

  })

  document.body.addEventListener('keyup', (e) => {
    if (go.indexOf(e.key) >= 0) batship.setState(0, batship.state.direction)
    if (direction.indexOf(e.key) >= 0) batship.setState(batship.state.go, 0)

    client.publish('raichu/'+room.id+'/positions', data)

  })
}

async function createRoom(){
  let team = document.getElementById("input_team").value;
  let nickname = document.getElementById("input_nickname").value;
  let gender = document.getElementById("input_gender").value;
  let ship = document.getElementById("input_starship").value;
  
  player = new Player(nickname, gender, null, team)
  room = new Room();
  starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
  player.setStartship(starShip)

  connect(rabbitmqSettings)
  changeToGame();
  player.starship.play()
  addKeyEvent(player.starship)

}

async function joinForm() {

  let idRoom = document.getElementById("input_gamecode").value;
  let team = document.getElementById("input_team_join").value;
  let nickname = document.getElementById("input_nickname_join").value;
  let gender = document.getElementById("input_gender_join").value;
  let ship = document.getElementById("input_starship_join").value;
  
  player = new Player(nickname, gender, null, team)
  room = new Room();
  room.id = idRoom;
  starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
  player.setStartship(starShip)

  connect(rabbitmqSettings)
  changeToGame();
  player.starship.play()
  addKeyEvent(player.starship)
    
}

function changeToGame(){
  var form = document.getElementById("menu");
  form.style.display = "none";

  var idRoom =  document.getElementById("id_room");
  idRoom.textContent = " Id Room:  " + room.id;
  idRoom.style.display = "block"

  var game = document.getElementById("galaxy");
  game.style.display = "block";
  
}


function paintOtherShip(player){
  let galaxy = document.getElementById('galaxy')
  let ship = StarShip.create(player.id, galaxy, player.starship.imagePath, 'small batship' , player.starship.x, player.starship.y, player.starship.angle)
  console.log(ship);
  otherShips[ship.id] = ship;
  otherShips[ship.id].play();     
  

}
