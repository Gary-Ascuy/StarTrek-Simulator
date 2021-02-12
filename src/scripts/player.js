class Player{
    constructor(id, nickname = "", gender = "", starship = null, team = "") {
        this.id = id
        this.nickname = nickname;
        this.gender = gender;
        this.team = team;
        if(starship)this.starship=starship
        this.alive=true
    }

    
    setStartship(starship) {
        this.starship = starship
    }

  

  }