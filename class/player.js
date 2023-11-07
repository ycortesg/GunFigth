import { GameObject } from "./gameObject.js";
import { setCustomProperty } from "./updateProperties.js";

export class Player extends GameObject {
	cooldown = false;
	velocityY = 2.5;
	velocityX = 1.8;
	movingTop;
	movingBottom;
	movingLeft;
	movingRight;
	cooldown = false;
	bulletsFired = 0;
	dead = false;
	deaths = 0;

	// Direction means the direction of the player
	constructor(x, y, width, height, direction) {
		super(x, y, width, height);
		this.setElement(direction);
	
		// Define the movement rectangle
		this.movementRect = {
			x: direction === "left" ? x - 60 : x - 125,
			y: 10,
			width: width + 150, 
			height: 265
		};
	}

	setElement(direccion) {
		this.playerElement = document.createElement("div");
		this.playerElement.classList.add("player");
		this.playerElement.classList.add(direccion);
		setCustomProperty(this.playerElement, "left", this.x + "px");
		setCustomProperty(this.playerElement, "bottom", this.y + "px");
	}

	// Sets default values for rounds
	setDefault(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.bulletsFired = 0;
		this.dead = false;
		if (this.playerElement.classList.contains("death")){
			this.playerElement.classList.remove("death");
		}
	}

	// Stops all movement
	stopMovement() {
		this.movingTop = false;
		this.movingBottom = false;
		this.movingLeft = false;
		this.movingRight = false;
	}

	// Get the element of the player
	getElement() {
		return this.playerElement;
	}

	// Updates the postition of the player
	updatePlayer() {
		// Update the player's position based on movement flags
		if (this.movingTop && this.y + this.velocityY <= this.movementRect.y + this.movementRect.height) {
			this.y += this.velocityY;
		}
		if (this.movingBottom && this.y - this.velocityY >= this.movementRect.y) {
			this.y -= this.velocityY;
		}
		if (this.movingLeft && this.x - this.velocityX >= this.movementRect.x) {
			this.x -= this.velocityX;
		}
		if (this.movingRight && this.x + this.velocityX <= this.movementRect.x + this.movementRect.width) {
			this.x += this.velocityX;
		}

		if (this.movingTop || this.movingBottom || this.movingLeft || this.movingRight){
			if (!this.playerElement.classList.contains("anim-walk")){
				this.playerElement.classList.add("anim-walk");
			}
		}else {
			if (this.playerElement.classList.contains("anim-walk")){
				this.playerElement.classList.remove("anim-walk");
			}
		}

		// Set custom CSS properties for player's position
		setCustomProperty(this.playerElement, "left", this.x + "px");
		setCustomProperty(this.playerElement, "bottom", this.y + "px");
	}


	// Sets a cooldown on the player
	cooldownAction() {
		this.cooldown = true;
		setTimeout(() => {
			this.cooldown = false;
		}, 500)
	}

	// Updates values on death
	setDeth() {
		this.playerElement.classList.add("death");

		this.width = 0;
		this.height = 0;
		this.dead = true;
		this.deaths += 1;
	}
}
