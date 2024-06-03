// Wrapping the canvas element with the window's "load" event listener
// to ensure the script waits for all the resources
// linked in the HTML to load completely
addEventListener("load", function () {
  // Canvas setup
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;

  // Class to keep track of the specified player input
  class InputHandler {}

  // Class to handle the projectiles (lasers and all)
  class Projectile {}

  // Class to handle the falling parts and screws
  class Particle {}

  // Class to control the main character, spritesheet to animate and so on
  class Player {}

  // Class acting as a blueprint to create and handle various enemeies
  class Enemy {}

  // Class to handle multiple backgrounds to create parllax effect
  class Layer {}

  // Class to connect all the layers and animate the entire game background
  class Background {}

  // Class to display the score, timer and other required info to the player
  class UI {}

  // Class that brings everything together to create a playable game
  class Game {}
});
