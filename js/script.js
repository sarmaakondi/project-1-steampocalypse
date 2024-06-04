// Wrapping the canvas element with the window's "load" event listener
// to ensure the script waits for all the resources
// linked in the HTML to load completely
window.addEventListener("load", function () {
  // Canvas setup
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;

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
        } else if (event.key === "d") {
          this.game.debug = !this.game.debug;
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
      this.image = document.getElementById("player");
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
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
      // Handle sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context) {
      // Debug mode to enable or disable attack box
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      // Draw player
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
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
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 37;
    }

    update() {
      this.x += this.speedX - this.game.speed;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
      // Sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }

    draw(context) {
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      context.fillStyle = "black";
      context.font = "25px Roboto";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
      this.lives = 2;
      this.score = this.lives;
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.score = this.lives;
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.score = 15;
      this.type = "lucky";
    }
  }

  // Class to handle multiple backgrounds to create parllax effect
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) {
        this.x = 0;
      }
      this.x -= this.game.speed * this.speedModifier;
    }

    draw(context) {
      context.drawImage(this.image, this.x, this.y);
      context.drawImage(this.image, this.x + this.width, this.y);
    }
  }

  // Class to connect all the layers and animate the entire game background
  class Background {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");
      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.4);
      this.layer3 = new Layer(this.game, this.image3, 1);
      this.layer4 = new Layer(this.game, this.image4, 1.5);
      this.layers = [this.layer1, this.layer2, this.layer3];
    }

    update() {
      this.layers.forEach((layer) => {
        layer.update();
      });
    }

    draw(context) {
      this.layers.forEach((layer) => {
        layer.draw(context);
      });
    }
  }

  // Class to display the score, timer and other required info to the player
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "League Gothic";
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
      // Draw the timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      // Draw game over messages
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score >= this.game.winningScore) {
          message1 = "You Win!";
          message2 = "Well done!";
        } else {
          message1 = "You Lose!";
          message2 = "Try again next time!";
        }
        context.font = "50px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 40
        );
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 40
        );
      }
      context.restore();
    }
  }

  // Class that brings everything together to create a playable game
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.background = new Background(this);
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
      this.gameTime = 0;
      this.timeLimit = 15000;
      this.speed = 1;
      this.debug = true;
    }

    update(deltaTime) {
      // Update timer state
      if (!this.gameOver) {
        this.gameTime += deltaTime;
      }
      if (this.gameTime >= this.timeLimit) {
        this.gameOver = true;
      }
      // Update background
      this.background.update();
      this.background.layer4.update();
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
              if (!this.gameOver) {
                this.score += enemy.score;
              }
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
      // Draw background
      this.background.draw(context);
      // Draw player
      this.player.draw(context);
      // Draw ui
      this.ui.draw(context);
      // Draw enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.enemies.push(new Angler1(this));
      } else if (randomize < 0.6) {
        this.enemies.push(new Angler2(this));
      } else {
        this.enemies.push(new LuckyFish(this));
      }
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
