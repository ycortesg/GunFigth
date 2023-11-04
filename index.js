import { Player } from "./class/player.js";
import { Bullet } from "./class/bullet.js";

// DOM containers
const gameContainer = document.querySelector("main");
const gameTimeContainer = document.querySelector("#game-time");
const shootOutTimeContainer = document.querySelector("#shoot-out");
const scoreP1Container = document.querySelector("#score-p1");
const scoreP2Container = document.querySelector("#score-p2");
const menuBtn = document.querySelector(".start-buttom");
const bulletsContainerP1 = document.querySelector("#bullets-p1");
const bulletsContainerP2 = document.querySelector("#bullets-p2");

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
let bulletsIcons = {"player1": [], "player2": []};
let lastUpdateTime = 0;

// Starts Game
createBullets();
menuBtn.addEventListener('click', () => {
	document.querySelector(".menu").style.opacity = 0;
	document.querySelector(".menu").style.zIndex = -1;
	startGame();
	window.requestAnimationFrame(update);
  });

// Main game loop

function update(time) {
	let deltaTime = time - lastUpdateTime;
	if (deltaTime > 1000 / frameRate) {
		console.log(idGameTimerInterval)

		// Updates players position
		player1.updatePlayer();
		player2.updatePlayer();

		// updates the bullets in the window
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
			});

		lastUpdateTime = time;
	}
	window.requestAnimationFrame(update);
}

function handleKeyDownKeyUp(e, state) {
	//movements Player1
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
		//movements Player2
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

	// Gets the initial position of the bullet
	let bulletPositionX = parseInt(
		player.x + (direction === "left" ? 0 : player.width)
	);
	let bulletPositionY = parseInt(player.y + player.height / 2);

	let bullet = new Bullet(
		bulletPositionX,
		bulletPositionY,
		bulletWidth,
		bulletHeight,
		direction
	);

	hideBullet(direction);

	// Adds one bullet fired to player
	player.bulletsFired += 1;

	// Adds cooldown to the player
	player.cooldownAction();

	// Adds the bullet to the bullets in window
	bulletsInWindow.push(bullet);

	// Adds th bullet element to the game container
	gameContainer.appendChild(bullet.getElement());
}

function onPlayerDies() {
	// Stops all movement of both players
	player1.stopMovement();
	player2.stopMovement();

	updateHeader();

	// onkeyup and onkeydown are unsigned
	onkeyup = onkeydown = () => { };
	clearInterval(idGameTimerInterval);

	// in 1.5 seconds the new round starts
	if (!(player1.dead && player2.dead)){
		setTimeout(() => {
			stopTimer();
			startRound();
		}, 1500);
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

	restartBullets()
    // Creates new player objects
  player1 = new Player(80, 100, 12, 26, "left");
  player2 = new Player(500, 100, 12, 26, "rigth");
  roundNum = 0;

  gameContainer.append(player1.getElement());
  gameContainer.append(player2.getElement());

	// Starts the round
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
		}
	}, 1000);
}

function startRound() {

  removeRoundContainer();
  addRoundScreen();
	setTimeout(() => {
		setTimeout(() => startTimer(),1000)
		
		restartBullets()
	
		// Sets players positions to default 
		player1.setDefault(80, 100, 12, 26);
		player2.setDefault(500, 100, 12, 26);
	
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
  } catch (error) {
    
  }
}

/**
 * function for add a screen with info of the actually round
 */
function addRoundScreen() {
	roundNum++;
  const roundContainer = document.createElement("div");
  roundContainer.classList.add("round");
  const title = document.createElement("h1");
  title.innerText = `ROUND ${roundNum}`;
  const whoWon = document.createElement("h3");
  if (player1.dead && player2.dead){
	whoWon.innerText = "DRAW";
  }else if (player1.dead){
	whoWon.innerText = "Player 2 Won";
  }else if (player2.dead){
	whoWon.innerText = "Player 1 Won";
  }
  document.querySelector(".container").appendChild(roundContainer);
  roundContainer.appendChild(title);
  roundContainer.appendChild(whoWon);
}

function stopTimer (){
	clearInterval(idGameTimerInterval); 
}

/**
 *  function so that when the game time runs out a "game over" menu appears and 
 *	there are two options, restart the game or go to the main menu.
 */

function gameOver(){
	const gameOverContainer = document.createElement("div");
	gameOverContainer.classList.add("gameOver");
	const title = document.createElement("h2");
	title.innerText = "GAME OVER";
	const actionsContainer = document.createElement("div");

	const finalResult = document.createElement("h3");
	finalResult.innerText = player1.deaths < player2.deaths ? "PLAYER 1 WON!" : 
		(player1.deaths > player2.deaths) ? "PLAYER 2 WON!" : "DRAW"; 

	const restart = document.createElement("h5");
	restart.innerText = "RESTART";
	const mainMenu = document.createElement("h5");
	mainMenu.innerText = "MENU";
	actionsContainer.appendChild(restart);
	actionsContainer.appendChild(mainMenu);
	
	disableBullets();
	onkeyup = onkeydown = () => { };
	player1.stopMovement();
	player2.stopMovement();

	document.querySelector(".container").appendChild(gameOverContainer);
	gameOverContainer.appendChild(finalResult);
	gameOverContainer.appendChild(title);
	gameOverContainer.appendChild(actionsContainer);

	// when u click in restart button, game will be restarted
	restart.addEventListener("click", () => {
		removegameOverContainer();
		player1.setDeth();
		player2.setDeth();
		startGame();
	});
	
	// when u click in menu button, u will go to main menu
	mainMenu.addEventListener("click", () => {
		document.querySelector(".menu").style.opacity = 1;
		document.querySelector(".menu").style.zIndex = 10;
		player1.setDeth();
		player2.setDeth();
		gameOverContainer.remove();
	})
}

// function for remove gameOverContainer
function removegameOverContainer() {
	try {
	  document.querySelector(".gameOver").remove();
	} catch (error) {
	  
	}
  }

  function disableBullets() {
	bulletsInWindow.forEach((bullet) => bullet.unableBullet());
  }

  function createBullets() {
	for (let i = 0 ; i<maxBullets ; i++){
		let bulletP1 = document.createElement('div');
		let bulletP2 = document.createElement('div');
		bulletsIcons.player1.push(bulletP1);
		bulletsIcons.player2.push(bulletP2);
		bulletsContainerP1.appendChild(bulletP1);
		bulletsContainerP2.appendChild(bulletP2);
	}
  }

  function restartBullets() {
	for (let player of Object.keys(bulletsIcons)){
		for (let element of bulletsIcons[player]) {
			if (element.classList.contains("hide-bullet")){
				element.classList.remove("hide-bullet");
			}
		}
	}
  }

  function hideBullet(direction){
	if (direction === "right"){
		bulletsIcons.player1[player1.bulletsFired].classList.add("hide-bullet");
	}else {
		bulletsIcons.player2[player2.bulletsFired].classList.add("hide-bullet");
	}
  }