// Wrapping the canvas element with the window's "load" event listener
// to ensure the script waits for all the resources
// linked in the HTML to load completely
window.addEventListener("load", function () {
  // Canvas setup
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 600;

  // Class to keep track of the specified player input
  class InputHandler {
    constructor(game) {
      this.game = game;
      // Handling keydown event
      window.addEventListener("keydown", (event) => {
        if (
          (event.key === "ArrowUp" || event.key === "ArrowDown") &&
          this.game.keys.indexOf(event.key) === -1
        ) {
          this.game.keys.push(event.key);
        }
      });
      // Handling keyup event
      window.addEventListener("keyup", (event) => {
        if (this.game.keys.indexOf(event.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
        }
      });
    }
  }

  // Class to handle the projectiles (lasers and all)
  class Projectile {}

  // Class to handle the falling parts and screws
  class Particle {}

  // Class to control the main character, spritesheet to animate and so on
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0;
      this.maxSpeed = 2;
    }

    update() {
      // Handling the player movement on y-axis
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
    }

    draw(context) {
      // Draw the player
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  // Class acting as a blueprint to create and handle various enemeies
  class Enemy {}

  // Class to handle multiple backgrounds to create parllax effect
  class Layer {}

  // Class to connect all the layers and animate the entire game background
  class Background {}

  // Class to display the score, timer and other required info to the player
  class UI {}

  // Class that brings everything together to create a playable game
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.keys = [];
    }

    update() {
      this.player.update();
    }

    draw(context) {
      this.player.draw(context);
    }
  }

  const game = new Game(canvas.width, canvas.height);

  // Animation loop setup
  function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.draw(context);
    requestAnimationFrame(animate);
  }

  animate();
});
