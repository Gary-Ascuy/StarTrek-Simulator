const rabbitmqSettings = {
  username: 'admin',
  password: 'admin',
  host: 'frontend.ascuy.me',
  port: 15675,
  keepalive: 20,
  path: 'ws'
}

let gameState = []
let starShips = []
let client = null
let room = null
let player = null
let starShip = null

async function connect(options) {
  try {
    client = await RsupMQTT.connect(options)
    player.id = client.clientId
    client.subscribe('raichu/'+room.id+'/informNewPosition').on(addNewShip )
    client.subscribe('raichu/'+room.id+'/informPositionOld').on(getOldships )
    client.subscribe('raichu/'+room.id+'/positions').on(changePosition)
    client.publish('raichu/'+room.id+'/informNewPosition', player)
    paintUser(player,true)
  } catch (error) {
    console.log(error)
  }
}

function getOldships(dataIn){
  var data = JSON.parse(dataIn.string)

  if(player.id===data.newShip){
    
    gameState.push(data.player)
    paintOtherShip(data.player)
    paintUser(data.player)
  }

  console.log(gameState)
  
}

function addNewShip(dataIn){
  //add new ship to the game state
  var data = JSON.parse(dataIn.string)

  if(player.id !== data.id){
    gameState.push(data)
    paintOtherShip(data)
    paintUser(data)
    client.publish('raichu/'+room.id+'/informPositionOld',{newShip:data.id, player})
  }
  
}


function paintUser(data,myUser=false){

  console.log(data)
  const klingon = document.getElementById(data.team)

  const divUser = document.createElement('div')
  divUser.className = 'user'
  if(myUser){
    divUser.style.border = "3px solid red"
    divUser.style.borderRadius = "10px"
  }
  
  const img = document.createElement('img')
  img.src = './assets/user/'+data.gender+'.svg'
  img.className = 'userIcon'
  
  const divData = document.createElement('div')
  
  const nickname = document.createElement("h4");
  nickname.textContent = "Nickname:"+data.nickname;


  const lives = document.createElement("h4");
  lives.textContent = "Lives:"+"1";


  divData.appendChild(nickname)
  divData.appendChild(lives)
  divUser.appendChild(img)
  divUser.appendChild(divData)
  klingon.appendChild(divUser)

}

function changePosition(dataIn){
  
  starShips.forEach(starShip => {
    if(starShip.id === dataIn.starShip_id ){
      starShip.x = dataIn.x;
      starShip.y = dataIn.y;
      starShip.angle = dataIn.angle;
      starShip.play();
    }
  });
  
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

    let data = { x : starShip.x,
      y : starShip.y,
      angle : starShip.angle,
      starShip_id : starShip.id}

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
  starShip = StarShip.create(galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
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
  starShip = StarShip.create(galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
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

  var player = document.getElementById("players");
  player.style.display = "inline-flex";
  
}


function paintOtherShip(player){
  let galaxy = document.getElementById('galaxy')
  let ship = StarShip.create(galaxy, player.starship.imagePath, 'small batship' , player.starship.x, player.starship.y, player.starship.angle)
  console.log(ship)
  starShips.push(ship);
  starShips[starShips.length-1].play();     
  

}
