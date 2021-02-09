function resolveMessage(msj, ownID, ships, client) {
    switch(msj.type) {
        case "arrival":
          console.log("A new contender has just arrived!!!!")
          console.log(msj.id)

          if(msj.id != ownID) {
            console.log("New ship, id:")
            console.log(msj.id)
            const batship = StarShip.create(galaxy, './assets/spaceship/batship.png', 'small batship', 200, 200, 45)
            ships[msj.id] = batship
            console.log(msj.id)
            client.publish('teamName/topic1', { type: "Existence notification", id: ID, x: ships[ID].x, y: ships[ID].y, angle: ships[ID].angle, sprite: SPRITEPATH })
          }
          break;
        case "Existence notification":
          if(msj.id != ownID && !(msj.id in ships)) {
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
          if(msj.id != ownID) {
            ships[msj.id].setPosition(msj.x, msj.y)
            ships[msj.id].setAngle(msj.angle)
          }
          break;
          
        default:
          console.log("A default test")
      }
}