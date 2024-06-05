// Wrapping the canvas element with the window's "load" event listener
// to ensure the script waits for all the resources
// linked in the HTML to load completely
window.addEventListener("load", function () {
  // Canvas setup
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 1200;
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

  // Class to handle the game sounds
  class SoundController {
    constructor() {
      this.powerUpSound = document.getElementById("powerup");
      this.powerDownSound = document.getElementById("powerdown");
      this.explosionSound = document.getElementById("explosion");
      this.shotSound = document.getElementById("shot");
      this.shieldSound = document.getElementById("shieldSound");
      this.bgmSound = document.getElementById("bgm");
    }

    powerUp() {
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.volume = 0.2;
      this.powerUpSound.play();
    }

    powerDown() {
      this.powerDownSound.currentTime = 0;
      this.powerDownSound.volume = 0.2;
      this.powerDownSound.play();
    }

    explosion() {
      this.explosionSound.currentTime = 0;
      this.explosionSound.volume = 0.2;
      this.explosionSound.play();
    }

    shot() {
      this.shotSound.currentTime = 0;
      this.shotSound.volume = 0.2;
      this.shotSound.play();
    }

    shield() {
      this.shieldSound.currentTime = 0;
      this.shieldSound.volume = 0.2;
      this.shieldSound.play();
    }

    bgm() {
      this.bgmSound.currentTime = 0;
      this.bgmSound.volume = 0.3;
      this.bgmSound.play();
    }
  }

  // Play BGM
  // const bgmSoundController = new SoundController();
  // bgmSoundController.bgm();

  // Class to handle the shield and its animation
  class Shield {
    constructor(game) {
      this.game = game;
      this.width = this.game.player.width;
      this.height = this.game.player.height;
      this.frameX = 0;
      this.maxFrame = 24;
      this.image = document.getElementById("shield");
      this.fps = 30;
      this.timer = 0;
      this.interval = 1000 / this.fps;
    }

    update(deltaTime) {
      if (this.frameX < this.maxFrame) {
        if (this.timer > this.interval) {
          this.frameX++;
          this.timer = 0;
        } else {
          this.timer += deltaTime;
        }
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.game.player.x,
        this.game.player.y,
        this.width,
        this.height
      );
    }

    reset() {
      this.frameX = 0;
      this.game.sound.shield();
    }
  }

  // Class to handle the projectiles (lasers and all)
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      // Disabled projectile without animation
      // this.width = 10;
      // this.height = 3;
      // this.image = document.getElementById("projectile");
      this.image = document.getElementById("fireball");
      this.width = 36.25;
      this.height = 20;
      this.speed = Math.random() * 0.2 + 2.8;
      this.frameX = 0;
      this.maxFrame = 3;
      this.fps = 10;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
    }

    update(deltaTime) {
      // Handle projectiles speed and state
      this.x += this.speed;
      if (this.timer > this.interval) {
        if (this.frameX < this.maxFrame) {
          this.frameX++;
        } else {
          this.frameX = 0;
        }
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.x > this.game.width * 0.8) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      // Disabled old projectile
      // context.drawImage(this.image, this.x, this.y);
      // Draw new projectile
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  // Class to handle the falling parts and screws
  class Particle {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("gears");
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.spriteSize = 50;
      this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
      this.size = this.spriteSize * this.sizeModifier;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.markedForDeletion = false;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.bounced = 0;
      this.bottomBounceBoundary = Math.random() * 80 + 60;
    }

    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
      if (this.y > this.game.height + this.size || this.x < -this.size) {
        this.markedForDeletion = true;
      }
      if (
        this.y > this.game.height - this.bottomBounceBoundary &&
        this.bounced < 2
      ) {
        this.bounced++;
        this.speedY *= -0.7;
      }
    }

    draw(context) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );
      context.restore();
    }
  }

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
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpLimit = 10000;
    }

    update(deltaTime) {
      // Handle the player movement on y-axis
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -this.maxSpeed;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = this.maxSpeed;
      } else {
        this.speedY = 0;
      }
      this.y += this.speedY;
      // Handle player movement boundaries
      if (this.y > this.game.height - this.height * 0.5) {
        this.y = this.game.height - this.height * 0.5;
      } else if (this.y < -this.height * 0.5) {
        this.y = -this.height * 0.5;
      }
      // Handle projectiles
      this.projectiles.forEach((projectile) => {
        projectile.update(deltaTime);
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
      // Handle power up
      if (this.powerUp) {
        if (this.powerUpTimer > this.powerUpLimit) {
          this.powerUpTimer = 0;
          this.powerUp = false;
          this.frameY = 0;
          this.game.sound.powerDown();
        } else {
          this.powerUpTimer += deltaTime;
          this.frameY = 1;
          if (this.game.ammo < this.game.maxPowerUpAmmo) {
            this.game.ammo += 0.1;
          }
        }
      }
    }

    draw(context) {
      // Debug mode to enable or disable attack box
      if (this.game.debug) {
        context.strokeRect(this.x, this.y, this.width, this.height);
      }
      // Draw projectiles
      this.projectiles.forEach((projectile) => {
        projectile.draw(context);
      });
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
    }

    shootTop() {
      // Shoot projectile from mouth and handle the ammo state
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 30)
        );
        this.game.ammo--;
      }
      this.game.sound.shot();
      if (this.powerUp) {
        this.shootBottom();
      }
    }

    shootBottom() {
      // Shoot projectile from tail and handle the ammo state
      if (this.game.ammo > 0) {
        this.projectiles.push(
          new Projectile(this.game, this.x + 80, this.y + 175)
        );
      }
    }

    enterPowerUp() {
      this.powerUpTimer = 0;
      this.powerUp = true;
      if (this.game.ammo < this.game.maxAmmo) {
        this.game.ammo = this.game.maxAmmo;
      }
      this.game.sound.powerUp();
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
      if (this.game.debug) {
        context.font = "25px Bangers";
        context.fillText(this.lives, this.x, this.y);
      }
    }
  }

  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler1");
      this.frameY = Math.floor(Math.random() * 3);
      this.lives = 5;
      this.score = this.lives;
    }
  }

  class Angler2 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("angler2");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 6;
      this.score = this.lives;
    }
  }

  class LuckyFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("lucky");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 5;
      this.score = 15;
      this.type = "lucky";
    }
  }

  class HiveWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 400;
      this.height = 227;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("hivewhale");
      this.frameY = 0;
      this.lives = 20;
      this.score = this.lives;
      this.type = "hive";
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class Drone extends Enemy {
    constructor(game, x, y) {
      super(game);
      this.width = 115;
      this.height = 95;
      this.x = x;
      this.y = y;
      this.image = document.getElementById("drone");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 3;
      this.score = this.lives;
      this.type = "drone";
      this.speedX = Math.random() * -4.5 - 0.5;
    }
  }

  class BulbWhale extends Enemy {
    constructor(game) {
      super(game);
      this.width = 270;
      this.height = 219;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("bulbwhale");
      this.frameY = Math.floor(Math.random() * 2);
      this.lives = 20;
      this.score = this.lives;
      this.speedX = Math.random() * -1.2 - 0.2;
    }
  }

  class MoonFish extends Enemy {
    constructor(game) {
      super(game);
      this.width = 227;
      this.height = 240;
      this.y = Math.random() * (this.game.height * 0.95 - this.height);
      this.image = document.getElementById("moonfish");
      this.frameY = 0;
      this.lives = 10;
      this.score = this.lives;
      this.type = "moon";
      this.speedX = Math.random() * -1.2 - 2;
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

  // Class to handle the types of explosion animations
  class Explosion {
    constructor(game, x, y) {
      this.game = game;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = x - this.width * 0.5;
      this.y = y - this.height * 0.5;
      this.frameX = 0;
      this.maxFrame = 8;
      this.fps = 30;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.markedForDeletion = false;
    }

    update(deltaTime) {
      this.x -= this.game.speed;
      if (this.timer > this.interval) {
        this.frameX++;
        this.timer = 0;
      } else {
        this.timer += deltaTime;
      }
      if (this.frameX > this.maxFrame) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class SmokeExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("smokeExplosion");
    }
  }

  class FireExplosion extends Explosion {
    constructor(game, x, y) {
      super(game, x, y);
      this.image = document.getElementById("fireExplosion");
    }
  }

  // Class to display the score, timer and other required info to the player
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 25;
      this.fontFamily = "Bangers";
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
      // Draw the timer
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      // Draw game over messages
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score >= this.game.winningScore) {
          message1 = "Gears of Glory Grind On! ";
          message2 = "Your mechanical marvel hums with victory!";
        } else {
          message1 = "A Cog in the Wrong Machine!";
          message2 = "Don't fret, grease the gears and try again!";
        }
        context.font = "80px " + this.fontFamily;
        context.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 25
        );
        context.font = "25px " + this.fontFamily;
        context.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 25
        );
      }
      // Draw the ammo and recharge state
      if (this.game.player.powerUp) {
        context.fillStyle = "#ffffbd";
      }
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
      this.background = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.sound = new SoundController();
      this.shield = new Shield(this);
      this.keys = [];
      this.enemies = [];
      this.particles = [];
      this.explosions = [];
      this.enemyTimer = 0;
      this.enemyInterval = 2000;
      this.ammo = 20;
      this.maxAmmo = 50;
      this.maxPowerUpAmmo = 100;
      this.ammoTimer = 0;
      this.ammoInterval = 350;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 300;
      this.gameTime = 0;
      this.timeLimit = 10000;
      this.speed = 1;
      this.debug = false;
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
      this.player.update(deltaTime);
      // Update ammo (projectile) state
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
          this.ammoTimer = 0;
        }
      } else {
        this.ammoTimer += deltaTime;
      }
      // Update shield
      this.shield.update(deltaTime);
      // Update particles
      this.particles.forEach((particle) => {
        particle.update();
      });
      this.particles = this.particles.filter(
        (particle) => !particle.markedForDeletion
      );
      // Update explosions
      this.explosions.forEach((explosion) => {
        explosion.update(deltaTime);
      });
      this.explosions = this.explosions.filter(
        (explosion) => !explosion.markedForDeletion
      );
      // Update enemy state
      this.enemies.forEach((enemy) => {
        enemy.update();
        if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true;
          this.addExplosion(enemy);
          this.shield.reset();
          // Draw 10 projectiles when enemy collides with player
          for (let i = 0; i < enemy.score; i++) {
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
          }
          // Powerup condition
          if (enemy.type === "lucky") {
            this.player.enterPowerUp();
          } else if (!this.gameOver) {
            this.score--;
          }
        }
        // Check for collision, update score and enemy lives
        this.player.projectiles.forEach((projectile) => {
          if (this.checkCollision(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            // Draw one particle when projectile hits the enemy
            this.particles.push(
              new Particle(
                this,
                enemy.x + enemy.width * 0.5,
                enemy.y + enemy.height * 0.5
              )
            );
            if (enemy.lives <= 0) {
              // Draw 10 projectiles when enemy died by projectiles
              for (let i = 0; i < enemy.score; i++) {
                this.particles.push(
                  new Particle(
                    this,
                    enemy.x + enemy.width * 0.5,
                    enemy.y + enemy.height * 0.5
                  )
                );
              }
              enemy.markedForDeletion = true;
              this.addExplosion(enemy);
              this.sound.explosion();
              // Condition to trigger powerup if enemy is moonfish type
              if (enemy.type === "moon") {
                this.player.enterPowerUp();
              }
              // Condition to create drones when hive is destroyed
              if (enemy.type === "hive") {
                for (let i = 0; i < 5; i++) {
                  this.enemies.push(
                    new Drone(
                      this,
                      enemy.x + Math.random() * enemy.width,
                      enemy.y + Math.random() * enemy.height * 0.5
                    )
                  );
                }
              }
              if (!this.gameOver) {
                this.score += enemy.score;
              }
              // Disabled below to ensure game runs for the full time limit
              // if (this.score >= this.winningScore) {
              //   this.gameOver = true;
              // }
            }
          }
        });
      });
      // Condition to add enemies dynamically
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
      // Draw ui
      this.ui.draw(context);
      // Draw player
      this.player.draw(context);
      // Draw shield
      this.shield.draw(context);
      // Draw particles
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      // Draw enemies
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      // Draw explosions
      this.explosions.forEach((explosion) => {
        explosion.draw(context);
      });
      // Adding layer4 after all the othe components to create depth
      this.background.layer4.draw(context);
    }

    addEnemy() {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.enemies.push(new Angler1(this));
      } else if (randomize < 0.6) {
        this.enemies.push(new Angler2(this));
      } else if (randomize < 0.7) {
        this.enemies.push(new HiveWhale(this));
      } else if (randomize < 0.8) {
        this.enemies.push(new BulbWhale(this));
      } else if (randomize < 0.9) {
        this.enemies.push(new MoonFish(this));
      } else {
        this.enemies.push(new LuckyFish(this));
      }
    }

    addExplosion(enemy) {
      const randomize = Math.random();
      if (randomize < 0.5) {
        this.explosions.push(
          new SmokeExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
      } else {
        this.explosions.push(
          new FireExplosion(
            this,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
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
    game.draw(context);
    game.update(deltaTime);
    requestAnimationFrame(animate);
  }

  animate(0);
});
