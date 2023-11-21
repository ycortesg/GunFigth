import { Player } from "./class/player.js";
import { Bullet } from "./class/bullet.js";
import { Bush } from "./class/bush.js";
import { Wall } from "./class/wall.js";

// DOM containers
const gameContainer = document.querySelector("main");
const gameTimeContainer = document.querySelector("#game-time");
const shootOutTimeContainer = document.querySelector("#shoot-out");
const scoreP1Container = document.querySelector("#score-p1");
const scoreP2Container = document.querySelector("#score-p2");
const menuBtn = document.querySelector(".start-buttom");
const bulletsContainerP1 = document.querySelector("#bullets-p1");
const bulletsContainerP2 = document.querySelector("#bullets-p2");

// Audios
let deathSound = new Audio("sounds/death.mp3");
let shootSound = new Audio("sounds/shoot.mp3");
gameContainer.append(deathSound);
gameContainer.append(shootSound);

// Game variables
const maxBullets = 6;
const gameTimeFull = 60;
const frameRate = 60;
const bulletWidth = 5;
const bulletHeight = 5;

// Timers variables
let idGameTimerInterval;
let idShootOutTimerInterval;
let gameTime;
let shootOutTime;

// Players
let player1;
let player2;
let roundNum;

// Bullets Shown on window
let bulletsInWindow = [];
let bushesInWindow = [];
let wallsInWindow = [];
let wallsAndBushesInWindow = [];
let bulletsIcons = { player1: [], player2: [] };
let lastUpdateTime = 0;

// Creates bottom bullets
createBullets();

// On click Start the game starts
menuBtn.addEventListener("click", () => {
  document.querySelector(".menu").style.opacity = 0;
  document.querySelector(".menu").style.zIndex = -1;
  startGame();
  window.requestAnimationFrame(update);
});

// Main game loop
function update(time) {
  let deltaTime = time - lastUpdateTime;
  if (deltaTime > 1000 / frameRate) {
    // Updates players position
    player1.updatePlayer();
    player2.updatePlayer();

    // Updates the bullets in the window
    bulletsInWindow
      .filter((e) => !e.destroyed)
      .forEach((bullet) => {
        bullet.updateBullet();

        // if any bullet touches a player the score and the tiemr changes
        if (player1.checkCollision(bullet)) {
          player1.setDeth();
          onPlayerDies();
        }
        if (player2.checkCollision(bullet)) {
          player2.setDeth();
          onPlayerDies();
        }

        // If any bullet touches a bush the bush gets smaller and the bullet gets destroyed
        for (let bush of bushesInWindow) {
          if (bush.checkCollision(bullet)) {
            bush.timesShooted += 1;
            bush.updateStateBush();
            bullet.unableBullet();
          }
        }

        // If any bullet touches a wall the bullet gets destroyed
        for (let wall of wallsInWindow) {
          if (wall.checkCollision(bullet)) bullet.unableBullet();
        }
      });

    lastUpdateTime = time;
  }
  window.requestAnimationFrame(update);
}

function handleKeyDownKeyUp(e, state) {
  // Movements Player1
  switch (e.toLowerCase()) {
    case "w":
      player1.movingTop = state;
      break;
    case "s":
      player1.movingBottom = state;
      break;
    case "a":
      player1.movingLeft = state;
      break;
    case "d":
      player1.movingRight = state;
      break;
    case "q":
      // When the input is onkeydown and the player dose not have a cooldown and has fired
      // les than 6 bullets calls the function shoot
      if (state && !player1.cooldown && player1.bulletsFired < maxBullets) {
        shoot(player1, "right");
      }
      break;
    // Movements Player2
    case "arrowup":
      player2.movingTop = state;
      break;
    case "arrowdown":
      player2.movingBottom = state;
      break;
    case "arrowleft":
      player2.movingLeft = state;
      break;
    case "arrowright":
      player2.movingRight = state;
      break;
    case "shift":
      // When the input is onkeydown and the player dose not have a cooldown and has fired
      // les than 6 bullets calls the function shoot
      if (state && !player2.cooldown && player2.bulletsFired < maxBullets) {
        shoot(player2, "left");
      }
      break;
    default:
      break;
  }
}

function shoot(player, direction) {
  shootSound.currentTime = 0;
  shootSound.play();

  // Gets the initial position of the bullet
  let bulletPositionX = parseInt(
    player.x + (direction === "left" ? 0 : player.width)
  );
  let bulletPositionY = parseInt(player.y + player.height / 2);

  // Creates the bullet
  let bullet = new Bullet(
    bulletPositionX,
    bulletPositionY,
    bulletWidth,
    bulletHeight,
    direction
  );

  // Hides a bullet at the footer
  hideBullet(direction);

  // Adds one bullet fired to player
  player.bulletsFired += 1;

  // Adds cooldown to the player
  player.cooldownAction();

  // Adds the bullet to the bullets in window
  bulletsInWindow.push(bullet);

  // Adds th bullet element to the game container
  gameContainer.appendChild(bullet.getElement());

  if (player.bulletsFired >= maxBullets) startShootOutTimer();
}

function onPlayerDies() {
  deathSound.currentTime = 0;
  deathSound.play();

  stopShootOutTimer();

  // Stops all movement of both players
  player1.stopMovement();
  player2.stopMovement();

  // The score in the header gets updated
  updateHeader();

  // onkeyup and onkeydown are unsigned
  onkeyup = onkeydown = () => {};
  clearInterval(idGameTimerInterval);
  if (
    [player1, player2].some((e) => e.deaths >= 3) &&
    ![player1, player2].every((e) => e.deaths >= 3)
  ) {
    setTimeout(() => {
      gameOver();
      stopTimer();
      stopShootOutTimer();
    }, 500);
  } else {
    // In 1.5 seconds the new round starts
    if (!(player1.dead && player2.dead)) {
      setTimeout(() => {
        if ([player1, player2].every((e) => e.deaths < 3)) {
          setTimeout(() => {
            stopTimer();
            startRound();
          }, 1000);
        }
      }, 500);
    }
  }
}

// Updates the header info
function updateHeader() {
  gameTimeContainer.innerText = gameTime;
  shootOutTimeContainer.innerText = shootOutTime;
  scoreP1Container.innerText = player2.deaths;
  scoreP2Container.innerText = player1.deaths;
}

function startGame() {
  // Removes the walls and bushes that may exist
  removeWallBush();

  // Makes all the bullet icons at the bottom visible
  restartBullets();

  // Creates new player objects
  player1 = new Player(80, 140, 30, 44, "left");
  player2 = new Player(530, 140, 30, 44, "right");

  // Restarts the number of rounds
  roundNum = 0;

  // Restarts bushes and walls
  bushesInWindow = [];
  wallsAndBushesInWindow = [];
  wallsInWindow = [];

  // Adds the players to the gameContainer
  gameContainer.append(player1.getElement());
  gameContainer.append(player2.getElement());

  // Starts the round
  addWallBush();
  startRound();

  // Set timer to default
  gameTime = gameTimeFull;
  shootOutTime = 0;

  // Updates header and starts timer
  updateHeader();
}

// Creates interval that updates the game time every second
function startTimer() {
  idGameTimerInterval = setInterval(() => {
    gameTime -= 1;
    updateHeader();
    if (gameTime === 0) {
      gameOver();
      stopTimer();
      stopShootOutTimer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(idGameTimerInterval);
}

function startShootOutTimer() {
  // If the shootout is runnig then it wont be runned again
  if (shootOutTime == 0) {
    shootOutTime = 10;
    idShootOutTimerInterval = setInterval(() => {
      shootOutTime -= 1;
      updateHeader();

      // If the shootout time is 0 or neither player has bullets left
      if (
        shootOutTime === 0 ||
        [player1, player2].every((e) => e.bulletsFired >= maxBullets)
      ) {
        // If  there bullets in the window and the time of the shootOut is more than 0 it doesn't
        // do anything otherways the shootOut timer is restarted
        if (bulletsInWindow.some((e) => !e.destroyed) && shootOutTime > 0) {
        } else {
          shootOutTime = 0;
          disableBullets();

          // Stops all movement of both players
          player1.stopMovement();
          player2.stopMovement();

          onkeydown = onkeyup = () => {};
          stopTimer();
          stopShootOutTimer();
          startRound();
        }
      }
    }, 1000);
  }
}

function stopShootOutTimer() {
  clearInterval(idShootOutTimerInterval);
}

function startRound() {
  removeRoundContainer();
  addRoundScreen();
  stopShootOutTimer();
  shootOutTime = 0;

  setTimeout(() => {
    startTimer();
    [player1, player2].forEach((e) => {
      e.cooldownAction();
    });

    // Restart the amount of bullets each player has fired
    restartBullets();

    // Restart the status of the bushes
    restartBushes();

    // if its not the first round and its less than round 6 adds a bush or a wall
    if (roundNum > 1 && roundNum < 6) addWallBush();

    // Sets players positions to default
    player1.setDefault(80, 140, 30, 44);
    player2.setDefault(530, 140, 30, 44);

    // Bullets in window array gets emptied
    bulletsInWindow = [];

    // Appends players to game Container
    gameContainer.append(player1.getElement());
    gameContainer.append(player2.getElement());

    // onkeyup and onkeydown are signed
    onkeyup = onkeydown = (e) => {
      handleKeyDownKeyUp(e.key, e.type === "keydown");
    };
  }, 2000);
}

function removeRoundContainer() {
  try {
    document.querySelector(".round").remove();
  } catch (error) {}
}

// Function to add a screen with info of the actual round
function addRoundScreen() {
  roundNum++;
  const roundContainer = document.createElement("div");
  roundContainer.classList.add("round");
  const title = document.createElement("h1");
  title.innerText = `ROUND ${roundNum}`;
  const whoWon = document.createElement("h3");
  if (player1.dead && player2.dead) {
    whoWon.innerText = "DRAW";
  } else if (player1.dead) {
    whoWon.innerText = "Player 2 Won";
  } else if (player2.dead) {
    whoWon.innerText = "Player 1 Won";
  }
  document.querySelector(".container").appendChild(roundContainer);
  roundContainer.appendChild(title);
  roundContainer.appendChild(whoWon);
}

/**
 *  Function so that when the game time runs out a "game over" menu appears and
 *	there are two options, restart the game or go to the main menu.
 */
function gameOver() {
  const gameOverContainer = document.createElement("div");
  gameOverContainer.classList.add("gameOver");
  const title = document.createElement("h2");
  title.innerText = "GAME OVER";
  const actionsContainer = document.createElement("div");

  const finalResult = document.createElement("h3");
  finalResult.innerText =
    player1.deaths < player2.deaths
      ? "PLAYER 1 WON!"
      : player1.deaths > player2.deaths
      ? "PLAYER 2 WON!"
      : "DRAW";

  const restart = document.createElement("h5");
  restart.innerText = "RESTART";
  const mainMenu = document.createElement("h5");
  mainMenu.innerText = "MENU";
  actionsContainer.appendChild(restart);
  actionsContainer.appendChild(mainMenu);

  disableBullets();
  onkeyup = onkeydown = () => {};
  player1.stopMovement();
  player2.stopMovement();

  document.querySelector(".container").appendChild(gameOverContainer);
  gameOverContainer.appendChild(finalResult);
  gameOverContainer.appendChild(title);
  gameOverContainer.appendChild(actionsContainer);

  // When u click in restart button, game will be restarted
  restart.addEventListener("click", () => {
    removegameOverContainer();
    player1.playerElement.remove();
    player2.playerElement.remove();
    startGame();
  });

  // When u click in menu button, u will go to main menu
  mainMenu.addEventListener("click", () => {
    document.querySelector(".menu").style.opacity = 1;
    document.querySelector(".menu").style.zIndex = 10;
    player1.playerElement.remove();
    player2.playerElement.remove();
    gameOverContainer.remove();
  });
}

// Function that removes gameOverContainer
function removegameOverContainer() {
  try {
    document.querySelector(".gameOver").remove();
  } catch (error) {}
}

// Disables all the bullets in the window
function disableBullets() {
  bulletsInWindow.forEach((bullet) => bullet.unableBullet());
}

// Creates the bullets of the footer
function createBullets() {
  for (let i = 0; i < maxBullets; i++) {
    let bulletP1 = document.createElement("div");
    let bulletP2 = document.createElement("div");
    bulletsIcons.player1.push(bulletP1);
    bulletsIcons.player2.push(bulletP2);
    bulletsContainerP1.appendChild(bulletP1);
    bulletsContainerP2.appendChild(bulletP2);
  }
}

// Makes all the bullets in the footer visible
function restartBullets() {
  for (let player of Object.keys(bulletsIcons)) {
    for (let element of bulletsIcons[player]) {
      if (element.classList.contains("hide-bullet")) {
        element.classList.remove("hide-bullet");
      }
    }
  }
}

// Hides the first bullet in one of the two containers in the footer
function hideBullet(direction) {
  if (direction === "right") {
    bulletsIcons.player1[player1.bulletsFired].classList.add("hide-bullet");
  } else {
    bulletsIcons.player2[player2.bulletsFired].classList.add("hide-bullet");
  }
}

// Adds a bush or a wall there is 30% chance of a wall and a 70 % of a bush and the position is random
function addWallBush() {
  let posX = Math.floor(Math.random() * 100) + 250;
  let posY = Math.floor(Math.random() * 260);
  let obj;

  // Makes the position y a value that does not overlaps any other object
  if (wallsAndBushesInWindow.length > 0) {
    while (
      wallsAndBushesInWindow.some((e) => {
        return e.y + 30 > posY && e.y - 30 < posY;
      })
    ) {
      posY = Math.floor(Math.random() * 260);
    }
  }
  if (Math.random() > 0.3) {
    obj = new Bush(posX, posY, 18, 35);
    bushesInWindow.push(obj);
  } else {
    obj = new Wall(posX, posY, 18, 35);
    wallsInWindow.push(obj);
  }

  wallsAndBushesInWindow.push(obj);
  gameContainer.append(obj.getElement());
}

// Removes all the bushes and walls from the game container
function removeWallBush() {
  for (let bush of bushesInWindow) {
    bush.removeElement();
  }
  for (let wall of wallsInWindow) {
    wall.removeElement();
  }
  bushesInWindow = [];
  wallsInWindow = [];
}

// Restarts all the states of the bushes in the window
function restartBushes() {
  bushesInWindow.forEach((e) => e.setDefaultState());
}
