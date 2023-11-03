// main object for game and check collisions
export class GameObject {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	checkCollision(object) {
		return (this.x < object.x + object.width
			&& this.x + this.width > object.x
			&& this.y < object.y + object.height
			&& this.y + this.height > object.y);
	}
}