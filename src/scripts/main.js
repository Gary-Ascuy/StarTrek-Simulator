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
    player.starship.id = player.id;
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
  divUser.c = 'user'
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


  console.log(data)
  const lives = document.createElement("h4");
  lives.textContent = "Lives:"+data.starship.life;
  lives.id = data.id;


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
    otherShips[data.starShipId].fireLaser(moveLaser);
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
      batship.fireLaser(moveLaser);
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
    starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 5, 5, 90)
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
    starShip = StarShip.create(player.id, galaxy, './assets/spaceship/'+ship+'.png', 'small batship', 5, 5, 90)
    player.setStartship(starShip)
    player.starship.id = player.id;

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


function showForm(form){

  var divButton = document.getElementById("initScreen");
  var formCreate = document.getElementById("form-create");
  var formJoin = document.getElementById("form-join");
  if(form === 1){

    divButton.style.display = "none";
    formCreate.style.display = "block";
  ;
  }else if(form === 2){

    divButton.style.display = "none";
    formJoin.style.display = "block";
  }else if(form === 3){

    divButton.style.display = "block";
    formCreate.style.display = "none";
    formJoin.style.display = "none";
  }
  
}

function paintOtherShip(player){

  let galaxy = document.getElementById('galaxy')
  let ship = StarShip.create(player.id, galaxy, player.starship.imagePath, 'small batship' , player.starship.x, player.starship.y, player.starship.angle)
  otherShips[ship.id] = ship;
  otherShips[ship.id].play();     

}

function modifyLifes(ship){
  console.log(ship)
  document.getElementById(ship.id).innerHTML = "Lifes:" + ship.life
}

function playerShooted(x,y,laser,laserInterval){
  
  Object.keys(otherShips).forEach(ship => {
    
    if(detectCollision(x,y,otherShips[ship].x,otherShips[ship].y)) {
      otherShips[ship].getShoot()
      clearInterval(laserInterval)
      laser.remove()
      modifyLifes(otherShips[ship])

    }else if(detectCollision(x,y, player.starship.x,player.starship.y)){
      player.starship.getShoot()
      clearInterval(laserInterval)
      laser.remove();
      modifyLifes(player.starship)
    } 
  });
}

function detectCollision(x1,y1,x2,y2){
  console.log(x1,y1)
  console.log(x2,y2)

  let distance = Math.hypot(Math.abs(x1-x2),Math.abs(y1-y2))
  console.log(distance)
  if(distance<25) return true
  else return false
}


function moveLaser(laser, angle, width, height) {
  let timeLifeLaser = 0;
  let laserInterval = setInterval(() => {
    let xPosition = parseInt(laser.style.left)
    let yPosition = parseInt(laser.style.top)

    if ( ( xPosition >= width || xPosition <= 0 ) || ( yPosition >= height || yPosition <= 0 ) || (angle === 0 || angle === 180) ) {
      laser.remove()
      clearInterval(laserInterval)
    }else {
      const x = Math.sin(angle / 360.0 * 2 * Math.PI) * 10
      const y = Math.cos(angle / 360.0 * 2 * Math.PI) * 10
      laser.style.left = `${xPosition + x}px`
      laser.style.top = `${yPosition - y}px`

      if(timeLifeLaser > 150){
        playerShooted(xPosition + x,yPosition - y, laser, laserInterval)
      }

      timeLifeLaser += 50;

    }
  }, 50)
}

