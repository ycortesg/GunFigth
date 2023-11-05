import { GameObject } from "./gameObject.js";
import { setCustomProperty } from "./updateProperties.js";

export class Wall extends GameObject {

	constructor(x, y, width, height) {
		super(x, y, width, height);
		this.setElement();
	
	}

	setElement() {
		this.wallElement = document.createElement("div");
		this.wallElement.classList.add("wall");
		setCustomProperty(this.wallElement, "left", this.x + "px");
		setCustomProperty(this.wallElement, "bottom", this.y + "px");
	}

	getElement() {
		return this.wallElement;
	}

    removeElement() {
		this.wallElement.remove();
	}

}
