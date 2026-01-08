import { Vector } from "./Vector.js";

type DrawStyle = "fill" | "stroke";

export class Rectangle implements IClonable {
	
	height: number;
	width: number;
	position: Vector;
	style: DrawStyle = "fill";
	color: string = "red";

	constructor(width: number, height: number, position: Vector = Vector.ZERO) {
		this.width = width;
		this.height = height;
		this.position = position;
	}

	clone(): Rectangle {
		return new Rectangle(this.width, this.height, this.position);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.closePath();
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		if (this.style === "fill")
			ctx.fill();
		else
			ctx.stroke();
	}
}