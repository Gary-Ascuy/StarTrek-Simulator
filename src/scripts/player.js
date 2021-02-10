class Player{
    constructor(nickname = "", gender = "", starship = null, team = "") {
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.nickname = nickname;
        this.gender = gender;
        this.team = team;
    }

    
    setStartship(starship) {
        this.starship = starship
    }

  

  }