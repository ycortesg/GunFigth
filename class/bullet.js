import { GameObject } from "./gameObject.js";
import { setCustomProperty } from "./updateProperties.js";

export class Bullet extends GameObject {
	bulletElement;
	velocity = 5;
	timeLife = 1500;
	direction;
	destroyed = false;

	constructor(x, y, width, height, direction) {
		super(x, y, width, height);
		this.direction = direction;
		this.setElement();
	}

	setElement() {
		this.bulletElement = document.createElement("div");
		this.bulletElement.classList.add("bullet");

		// Posicionamos la bala en función de la dirección
		setCustomProperty(this.bulletElement, "left", this.x + "px");
		setCustomProperty(this.bulletElement, "bottom", this.y + "px");

		// Tiempo que durará la bala en el DOM
		setTimeout(() => {
			this.bulletElement.remove();
			this.destroyed = true;
		}, this.timeLife);
	}

	getElement() {
		return this.bulletElement;
	}

	updateBullet() {
		// Actualizamos la posición en función de la dirección
		if (this.direction === "left") {
			this.x -= this.velocity;
		} else if (this.direction === "right") {
			this.x += this.velocity;
		}

		setCustomProperty(this.bulletElement, "left", this.x + "px");

	}
}
