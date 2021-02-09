class StarShip {
    constructor(id, el, x = 0, y = 0, angle = 0, imagePath) {
      this.id = id
      this.el = el
      this.imagePath = imagePath
      this.setState()
      this.setAngle(angle)
      this.setPosition(x, y)
      this.setVisibility(true)
    }
  
    setState(go = 0, direction = 0) {
      this.state = { go, direction }
    }
  
    setAngle(angle) {
      this.angle = angle
      this.el.style.transform = `rotate(${angle}deg)`
    }
  
    setPosition(x, y) {
      this.x = x
      this.y = y
  
      this.el.style.left = `${x}px`
      this.el.style.top = `${y}px`
    }
  
    setVisibility(visible) {
      this.el.style.visibility = visible ? 'visible' : 'hidden'
    }
  
    play() {
      this.timer = setInterval(()=> {
        const { go, direction } = this.state  
        if (go === 0 && direction === 0) return;
  
        const angle = (this.angle + direction) % 360
        const x = this.x + Math.sin(this.angle / 360.0 * 2 * Math.PI) * go
        const y = this.y - Math.cos(this.angle / 360.0 * 2 * Math.PI) * go
    
        this.setPosition(x, y)
        this.setAngle(angle)
      }, 30)
    }
  
    stop() {
      clearInterval(this.timer)
    }

    //*********************** */

    createLaserElement(angle) {
      let xPosition = parseInt(window.getComputedStyle(this.el).getPropertyValue('left'))
      let yPosition = parseInt(window.getComputedStyle(this.el).getPropertyValue('top'))

      const x = Math.sin(angle / 360.0 * 2 * Math.PI) * 10
      const y = Math.cos(angle / 360.0 * 2 * Math.PI) * 10 
      let newLaser = document.createElement('img')
      newLaser.src = 'assets/spaceship/laser.png'
      newLaser.classList.add('laser')
      newLaser.style.left = `${xPosition + 20}px`
      newLaser.style.top = `${yPosition + 20}px`
      return newLaser
    }

    moveLaser(laser, angle) {
      let laserInterval = setInterval(() => {
        let xPosition = parseInt(laser.style.left)
        let yPosition = parseInt(laser.style.top)
        console.log("angulo" + angle)
        if (xPosition >= 1000 || xPosition <= 0 || (angle === 0 || angle === 180) ) {
          laser.remove()
        } else if ( yPosition < 0) {
          
          laser.style.top = `${400}px`
        }else if ( yPosition > 400) {
          
          laser.style.top = `${0}px`
        }else {
          const x = Math.sin(angle / 360.0 * 2 * Math.PI) * 10
          const y = Math.cos(angle / 360.0 * 2 * Math.PI) * 10
          //console.log(x)
          //console.log(y)
          laser.style.left = `${xPosition + x}px`
          laser.style.top = `${yPosition - y}px`

          //console.log(laser.style.left)
          //console.log(laser.style.top)
        }
      }, 30)
    }

    fireLaser() {
      const mainPlayArea = document.getElementById('galaxy')

      const { go, direction } = this.state
      const angle = (this.angle + direction) % 360
      console.log(go, direction, angle)

      let laser = this.createLaserElement(angle, direction)
      mainPlayArea.appendChild(laser)

      this.moveLaser(laser, angle)
    }
  
//*********************** */
  
    static create(id, parent, imagePath, extraClass, x = 0, y = 0, angle = 0) {
      const img = document.createElement('img')
      img.className = `starship ${extraClass}`
      img.src = imagePath
      parent.appendChild(img)
  
      return new StarShip(id, img, x, y, angle, imagePath)
    }
  }