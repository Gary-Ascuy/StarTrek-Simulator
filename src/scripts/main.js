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
    client.subscribe('raichu/'+room.id+'/bullets').on(getOtherBullets)

    client.publish('raichu/'+room.id+'/informNewPosition', player)
    paintUser(player,true)
  } catch (error) {
    console.log(error)
  }
}

function getOldShips(dataIn){
  var data = JSON.parse(dataIn.string)
  if(player.id===data.newShip){
    paintOtherShip(data.player)
    paintUser(data.player)
  }
  
}

function addNewShip(dataIn){
  var data = JSON.parse(dataIn.string)
  if(player.id !== data.id){
    paintOtherShip(data)
    paintUser(data)
    client.publish('raichu/'+room.id+'/informPositionOld',{newShip:data.id, player})
  }
  
}


function paintUser(data,myUser=false){

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

  var data = JSON.parse(dataIn.string)

  if( otherShips[data.starShipId] !== undefined && otherShips[data.starShipId] !== null){
    otherShips[data.starShipId].setPosition(data.x, data.y);
    otherShips[data.starShipId].setAngle(data.angle);
  }
}

function getOtherBullets(dataIn){
  var data = JSON.parse(dataIn.string)
  if( otherShips[data.starShipId] !== undefined && otherShips[data.starShipId] !== null){
    otherShips[data.starShipId].fireLaser();
  }
}


function addKeyEvent(batship) {
  const up = ['w', 'ArrowUp']
  const down = ['s', 'ArrowDown']
  const left = ['a', 'ArrowLeft']
  const right = ['d', 'ArrowRight']
  const shoot = ['Enter']
  const go = [...up, ...down]
  const direction = [...left, ...right]
  const stop = [' ', 'c', 'x']


  document.body.addEventListener('keydown', (e) => {
    if (up.indexOf(e.key) >= 0) batship.setState(1, batship.state.direction)
    if (down.indexOf(e.key) >= 0) batship.setState(-1, batship.state.direction)
    if (left.indexOf(e.key) >= 0) batship.setState(batship.state.go, -1)
    if (right.indexOf(e.key) >= 0) batship.setState(batship.state.go, 1)

    if (stop.indexOf(e.key) >= 0) batship.setState(0, 0)
    if (shoot.indexOf(e.key) >= 0){
      batship.fireLaser();
      let data = { starShipId : player.id}
      client.publish('raichu/'+room.id+'/bullets', data );
    } 

    let data = { x : starShip.x,
      y : starShip.y,
      angle : starShip.angle,
      starShipId : player.id}

    client.publish('raichu/'+room.id+'/positions', data)

  })

  document.body.addEventListener('keyup', (e) => {
    if (go.indexOf(e.key) >= 0) batship.setState(0, batship.state.direction)
    if (direction.indexOf(e.key) >= 0) batship.setState(batship.state.go, 0)

  })
}

async function createRoom(){
  let team = document.getElementById("input_team").value;
  let nickname = document.getElementById("input_nickname");
  let gender = document.getElementById("input_gender").value;
  let ship = document.getElementById("input_starship").value;
  
  
  if(nickname.value.length===0){
    nickname.style.borderColor = "red";
  }
  else{
    player = new Player(nickname.value, gender, null, team)
    room = new Room();
    starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
    player.setStartship(starShip)

    connect(rabbitmqSettings)
    changeToGame();
    player.starship.play()
    addKeyEvent(player.starship)

    nickname.style.borderColor = "white";
  }
  

}

async function joinForm() {

  let idRoom = document.getElementById("input_gamecode");
  let team = document.getElementById("input_team_join").value;
  let nickname = document.getElementById("input_nickname_join");
  let gender = document.getElementById("input_gender_join").value;
  let ship = document.getElementById("input_starship_join").value;
  
  console.log("ENTROO")
  if(nickname.value.length===0){
    nickname.style.borderColor = "red";
  }
  else nickname.style.borderColor = "white";

  if(idRoom.value.length===0){
    
    idRoom.style.borderColor = "red";
  }
  else idRoom.style.borderColor = "white";


  if(idRoom.value.length!==0 && nickname.value.length!==0){
    player = new Player(nickname.value, gender, null, team)
    room = new Room();
    room.id = idRoom.value;
    starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 0, 0, 90)
    player.setStartship(starShip)

    connect(rabbitmqSettings)
    changeToGame();
    player.starship.play()
    addKeyEvent(player.starship)    
  }
    
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
  let ship = StarShip.create(player.id, galaxy, player.starship.imagePath, 'small batship' , player.starship.x, player.starship.y, player.starship.angle)
  otherShips[ship.id] = ship;
  otherShips[ship.id].play();     

}
