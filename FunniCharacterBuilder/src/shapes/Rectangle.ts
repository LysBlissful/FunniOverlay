import { Shape } from "./Shape.js";

export class Rectangle extends Shape {
	height: number;
	width: number;
	constructor(width: number, height: number) {
		super();
		this.width = width;
		this.height = height;
	}

	clone(): Rectangle {
		return new Rectangle(this.width, this.height);
	}

	override draw(ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
		ctx.beginPath();
		ctx.rect(x, y, this.width, this.height);
		ctx.closePath();
		super.draw(ctx, x, y);
	}
}