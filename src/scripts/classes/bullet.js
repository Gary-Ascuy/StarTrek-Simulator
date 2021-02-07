class Bullet {
  constructor(el, x = 0, y = 0, angle = 0, id) {
    this.el = el
    this.setState()
    this.setAngle(angle)
    this.setPosition(x, y)
    this.setVisibility(true)
    this.setTim
    this.speed = 7
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
    
      const ship_width = document.getElementsByClassName(this.el.className)[0].width
      const ship_height = document.getElementsByClassName(this.el.className)[0].height
      const window_width= document.getElementById('galaxy').clientWidth
      const window_height= document.getElementById('galaxy').clientHeight

      if (x <= 0) x = window_width -(ship_width+1);
      if (x +ship_width >= window_width) x = 0;

      if (y <= 0) y = window_height -(ship_height+1);
      if (y +ship_height >= window_height) y=0;
      
      this.x = x
      this.y = y

      this.el.style.left = `${x + 18}px`
      this.el.style.top = `${y + 18}px`
    }
  }

  setVisibility(visible) {
    this.el.style.visibility = 'visible'
  }

  play() {
    this.timer = setInterval(()=> { 
      const { go, direction } = this.state 

      const angle = (this.angle + direction) % 360
      const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
      const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go * this.speed
  
      this.setPosition(x, y)
      this.setAngle(angle)
    }, 1000/24)
  }

  stop() {
    clearInterval(this.timer)
  }

  static create(parent, imagePath, x = 0, y = 0, angle = 0, id) {

    // "time-to-live" of the bullet
    const ttl = setInterval(() => {      
      let bullet = document.getElementById(id)
      bullet.parentNode.removeChild(bullet);
      clearInterval(ttl)
    }, 2500);

    // creation of the element 'bullet' in the DOM
    const img = document.createElement('img')
    img.className = `bullet`
    img.id = id
    img.src = imagePath
    parent.appendChild(img)
    return new Bullet(img, x, y, angle)
  }
}