class Bullet {
  constructor(el, x = 0, y = 0, angle = 0) {
    this.el = el
    this.setState()
    this.setAngle(angle)
    this.setPosition(x, y)
    this.setVisibility(true)
    this.setTim
  }

  setState(go = 0, direction = 0) {
    this.state = { go, direction }
  }

  setAngle(angle) {
    this.angle = angle
    this.el.style.transform = `rotate(${angle}deg)`
  }

  setPosition(x, y) {

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

    this.el.style.left = `${x}px`
    this.el.style.top = `${y}px`

  }

  setVisibility(visible) {
    this.el.style.visibility = 'visible'
  }

  play() {
    this.timer = setInterval(()=> {
      const { go, direction } = this.state 

      const angle = (this.angle + direction) % 360
      const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go
      const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go
  
      this.setPosition(x, y)
      this.setAngle(angle)
    }, 10)
  }

  stop() {
    clearInterval(this.timer)
  }

  static create(parent, imagePath, x = 0, y = 0, angle = 0) {
    const img = document.createElement('img')
    img.className = `bullet`
    img.src = imagePath
    parent.appendChild(img)
    return new Bullet(img, x, y, angle)
  }
}