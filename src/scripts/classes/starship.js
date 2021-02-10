class StarShip {
  static players = []
  static id = 0
  constructor(el, x = 0, y = 0, angle = 0, id) {
    this.el = el
    this.setState()
    this.setAngle(angle)
    this.setPosition(x, y)
    this.setVisibility(true)
    this.speed = 4
    this.ship_width = document.getElementsByClassName(this.el.className)[0].width
    this.ship_height = document.getElementsByClassName(this.el.className)[0].height
    this.radio = this.ship_height/2
    this.id = id
    this.health = 100
    this.points = 0
    // this.id = StarShip.id
    // StarShip.id ++
    StarShip.players.push(this)
  }

  setState(go = 0, direction = 0) {
    this.state = { go, direction }
  }

  setAngle(angle) {
    this.angle = angle
    this.el.style.transform = `rotate(${angle}deg)`
  }

  setPosition(x, y) {

    const window_width= document.getElementById('galaxy').clientWidth
    const window_height= document.getElementById('galaxy').clientHeight

    if (x <= 0) x = window_width -(this.ship_width+1);
    if (x +this.ship_width >= window_width) x = 0;

    if (y <= 0) y = window_height -(this.ship_height+1);
    if (y +this.ship_height >= window_height) y=0;

    this.x = x
    this.y = y

    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`

  }

  getX(){
    return this.x;
  }

  getY(){
    return this.y;
  }

  getAngle(){
    return this.angle;
  }

  setHealth(health){
    this.health = health
  }

  setPoints(points){
    this.points = points
  }

  setVisibility(visible) {
    this.el.style.visibility = visible ? 'visible' : 'hidden'
  }

  play() {
    this.timer = setInterval(()=> {
      const { go, direction } = this.state  
      if (go === 0 && direction === 0) return;


      const angle = (this.angle + direction*5) % 360
      const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
      const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
  
      this.setPosition(x, y)
      this.setAngle(angle)

      client.publish('teamName/topic1', { type: "Ship movement", id: ID, x: x, y: y, angle: angle })
    }, 1000/24)
  }

  
  static create(parent, imagePath, extraClass, x = 0, y = 0, angle = 0, id) {
    const img = document.createElement('img')
    img.className = `starship ${extraClass}`
    img.src = imagePath
    parent.appendChild(img)
   
    return new StarShip(img, x, y, angle, id)
  }
}