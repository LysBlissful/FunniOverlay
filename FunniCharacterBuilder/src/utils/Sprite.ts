import { Vector } from "../physics/Vector.js";

export class Sprite {
	
	#offset: Vector;
	src: CanvasImageSource = null!;
	tintColor: string;
	
	constructor(offestX: number = 0, offestY: number = 0) {
		this.#offset = new Vector(offestX, offestY);
		this.tintColor = "rgba(0, 0, 0, 0)";
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
		// Draw the sprite to the canvas
		//let image = this.#applyFilter()
		const X = x - this.#offset.x;
		const Y = y - this.#offset.y;
		ctx.drawImage(this.src, X, Y);
	}
}