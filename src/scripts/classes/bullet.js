class Bullet {
  constructor(el, x = 0, y = 0, angle = 0, id) {
    this.el = el
    this.setState()
    this.setAngle(angle)
    this.setPosition(x, y)
    this.setVisibility(true)
    this.id = id
    this.speed = 10
    this.width = document.getElementsByClassName(this.el.className)[0].width
    this.height = document.getElementsByClassName(this.el.className)[0].height
    this.radio = this.height/2
 
  }

  setState(go = 0, direction = 0) {
    this.state = { go, direction }
  }

  setAngle(angle) {
    this.angle = angle
    this.el.style.transform = `rotate(${angle}deg)`
  }

  setPosition(x, y) { 
    
    if(document.getElementsByClassName(this.el.className)[0] === undefined){
      
      this.stop();
      
    } else {
    

      const window_width= document.getElementById('galaxy').clientWidth
      const window_height= document.getElementById('galaxy').clientHeight

      if (x <= 0) x = window_width -(this.width+1);
      if (x +this.width >= window_width) x = 0;

      if (y <= 0) y = window_height -(this.height+1);
      if (y +this.height >= window_height) y=0;
      
      this.x = x
      this.y = y

      this.el.style.left = `${x+18}px`
      this.el.style.top = `${y+18}px`
    }
  }

  setVisibility(visible) {
    if (visible) {
      this.el.style.visibility = 'none'
    
    }else{
      this.el.style.visibility = 'hidden'
    }
  }


  play() {
    this.timer = setInterval(()=> { 
      const { go, direction } = this.state 

      const angle = (this.angle + direction) % 360
      const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
      const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
  
      this.setPosition(x, y)
      this.setAngle(angle)
      this.detectColition()
    }, 1000/24)
  }

  detectColition(){
    const listPlayers = StarShip.players
    setTimeout( () => {
      listPlayers.forEach(player => {
        if (Math.hypot(player.x - this.x, player.y - this.y) < player.radio + this.radio){
          this.setVisibility(false)
          this.stop() // Detiene la bala
          this.setPosition(0,0)

          if(ID != player.id) // not to shoot myself!
            this.updatePointsAndHealth (ID, player.id)

        } 
      }
      )},250)
}

  updatePointsAndHealth (myId, enemyId){    
    console.log(`Yo #${myId} le di a #${enemyId}`)
    ships[myId].points += 10
    ships[enemyId].health -= 25    
    
    // 'Shooter' status after shooting
    client.publish('teamName/topic1', { 
      type: "Ship shooting", 
      id: myId, 
      health: ships[myId].health,
      points: ships[myId].points,
    })

    // 'Enemy target' status after shooting
    client.publish('teamName/topic1', { 
      type: "Ship shooting", 
      id: enemyId, 
      health: ships[enemyId].health,
      points: ships[enemyId].points,
    })

    updateUserStatusInDOM()
  }

  stop() {
    clearInterval(this.timer)
  }

  static create(parent, imagePath, x = 0, y = 0, angle = 0, id) {

    // "time-to-live" of the bullet
    const ttl = setInterval(() => {      
      let bullet = document.getElementById(id)
      bullet.parentNode.removeChild(bullet)
      clearInterval(ttl)
    }, 2000);

    // creation of the element 'bullet' in the DOM
    const img = document.createElement('img')
    img.className = `bullet`
    img.id = id
    img.src = imagePath
    parent.appendChild(img)
    return new Bullet(img, x, y, angle, id)

  }
}