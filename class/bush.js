import { GameObject } from "./gameObject.js";
import { setCustomProperty } from "./updateProperties.js";

export class Bush extends GameObject {
    timesShooted = 0;
    defaultHeight;
    defaultWidth;

	constructor(x, y, width, height) {
		super(x, y, width, height);
        this.defaultHeight = height;
        this.defaultWidth = width;
		this.setElement();
	}

	setElement() {
		this.bushElement = document.createElement("div");
		this.bushElement.classList.add("bush");
        this.imgContainer = document.createElement("div");
        this.img = document.createElement("img");
        this.img.src = "Icons/bush.png";
        this.imgContainer.appendChild(this.img);
        this.bushElement.appendChild(this.imgContainer);
		setCustomProperty(this.bushElement, "left", this.x + "px");
		setCustomProperty(this.bushElement, "bottom", this.y + "px");
	}

    updateStateBush(){
        if (this.timesShooted < 3 ){
            this.height -= this.height/3 + Math.trunc(Math.random()*7);
            setCustomProperty(this.img, "top", `-${this.defaultHeight-this.height}px`);
            
        }else{
            this.height = 0;
            this.width = 0;
        }
        setCustomProperty(this.bushElement, "height", this.height + "px");
    }

    setDefaultState (){
        this.timesShooted = 0;
        this.height = this.defaultHeight;
        this.width = this.defaultWidth ;
        setCustomProperty(this.bushElement, "height", this.height + "px");
        setCustomProperty(this.bushElement, "width", this.width + "px");
        setCustomProperty(this.img, "top", `0px`);

    }

	getElement() {
		return this.bushElement;
	}

    removeElement() {
		this.bushElement.remove();
	}

}
