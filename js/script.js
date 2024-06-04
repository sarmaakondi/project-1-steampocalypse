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
      // Handle keydown event
      window.addEventListener("keydown", (event) => {
        if (
          (event.key === "ArrowUp" || event.key === "ArrowDown") &&
          this.game.keys.indexOf(event.key) === -1
        ) {
          this.game.keys.push(event.key);
        } else if (event.key === " ") {
          this.game.player.shootTop();
        }
      });
      // Handle keyup event
      window.addEventListener("keyup", (event) => {
        if (this.game.keys.indexOf(event.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(event.key), 1);
        }
      });
    }
  }

  // Class to handle the projectiles (lasers and all)
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.width = 10;
      this.height = 3;
      this.speed = 3;
      this.markedForDeletion = false;
    }

    update() {
      // Handle projectiles speed and state
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      // Draw projectiles
      context.fillStyle = "gold";
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }

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
      this.projectiles = [];
    }

    update() {
      // Handle the player movement on y-axis
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
      // Handle projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update();
      });
      this.projectiles = this.projectiles.filter(
        (projectile) => !projectile.markedForDeletion
      );
    }

    draw(context) {
      // Draw player
      context.fillStyle = "black";
      context.fillRect(this.x, this.y, this.width, this.height);
      // Draw projectiles
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
    }

    shootTop() {
      // Shoot projectile from top and handle the ammo state
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );
        this.game.ammo--;
      }
    }
  }

  // Class acting as a blueprint to create and handle various enemeies
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.lives = 5;
      this.score = this.lives;
    }

    update() {
      this.x += this.speedX;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "black";
      context.font = "25px Roboto";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228 * 0.3;
      this.height = 169 * 0.3;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
    }
  }

  // Class to handle multiple backgrounds to create parllax effect
  class Layer {}

  // Class to connect all the layers and animate the entire game background
  class Background {}

  // Class to display the score, timer and other required info to the player
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Roboto";
      this.color = "white";
    }

    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.font = this.fontSize + "px " + this.fontFamily;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      // Draw the score
      context.fillText("Score: " + this.game.score, 20, 40);
      // Draw the ammo and recharge state
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      context.restore();
    }
  }

  // Class that brings everything together to create a playable game
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = [];
      this.enemies = [];
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.ammoTimer = 0;
      this.ammoInterval = 500;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 10;
    }

    update(deltaTime) {
      // Update player state
      this.player.update();
      // Update ammo (projectile) state
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
          this.ammoTimer = 0;
        }
      } else {
        this.ammoTimer += deltaTime;
      }
      // Update enemy state
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
        }
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              this.score += enemy.score;
              if (this.score >= this.winningScore) {
                this.gameOver = true;
              }
            }
          }
        });
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
    }

    draw(context) {
      // Draw player
      this.player.draw(context);
      // Draw ui
      this.ui.draw(context);
      // Draw enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
    }

    addEnemy() {
      this.enemies.push(new Angler1(this));
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTimeStamp = 0;

  // Animation loop setup
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    context.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(context);
    requestAnimationFrame(animate);
  }

  animate(0);
});
