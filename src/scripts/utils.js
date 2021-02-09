function getRandomCode(){
  // Creates a 9 character string of numbers and letters
  return Math.random().toString(36).substr(2, 9);
}

function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

function getLetterRandomCode(){
  let index = 0
  let code = ""
  const alphabetArray = "abcdefghijklmnopqrstuvwxyz".split("");
  for (let i = 0; i < 5; i++) {
    index = getRandomInt(alphabetArray.length)
    code = code + alphabetArray[index]
  }
  return code
}