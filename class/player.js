import { Bullet } from "./bullet.js";
import { GameObject } from "./gameObject.js";
import { setCustomProperty } from "./updateProperties.js";

export class Player extends GameObject {
  cooldown = false;
  valocityY = 1.6;
  valocityX = 0.8;
  movingTop ;
  movingBottom ;
  movingLeft ;
  movingRight ;
  cooldown = false;
  bulletsFired = 0;
  dead = false;
  deaths = 0;

  // direction means the direction of the player
  constructor(x, y, width, height, direction) {
    super(x, y, width, height)
    this.setElement(direction);
   }

  setElement(direccion) {
    this.playerElement = document.createElement("div");
    this.playerElement.classList.add("player");
    this.playerElement.classList.add(direccion);
    setCustomProperty(this.playerElement, "left", this.x + "px");
    setCustomProperty(this.playerElement, "bottom", this.y + "px");
  }

 // Sets default values for rounds
  setDefault(x, y, width, height){
    this.x = x;
    this.y = y; 
    this.width = width; 
    this.height = height;
    this.bulletsFired = 0;
    this.dead = false;
  }

  // Stops all movement
  stopMovement(){
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
    if (this.movingTop) this.y += this.valocityY;
    if (this.movingBottom && this.y > 0) this.y -= this.valocityY;
    if (this.movingLeft && this.x > 0) this.x -= this.valocityX;
    if (this.movingRight) this.x += this.valocityX;
    
    setCustomProperty(this.playerElement, "left", this.x + "px");
    setCustomProperty(this.playerElement, "bottom", this.y + "px");
  }

  // Sets a cooldown on the player
  cooldownAction(){
    this.cooldown = true;
    setTimeout(()=>{
      this.cooldown = false;
    }, 500)
  }

  // Updates values on death
  setDeth(){
    this.playerElement.remove();
    this.width = 0;
    this.height = 0;
    this.dead = true;
    this.deaths += 1;
  }
}
