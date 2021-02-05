class Room{
    constructor(players = []) {
        this.id = Math.random().toString(36).substr(2, 9);
    }

    
    addPlayer(player) {
        this.players.push(player);
      }

  }