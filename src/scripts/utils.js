function generateRandomMCode(){
  // Creates a 7 character string of numbers and letters
  return Math.random().toString(36).substr(2, 9);
}