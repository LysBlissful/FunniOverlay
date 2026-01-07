import { Vector } from "../physics/Vector.js";
import { Shape } from "./Shape.js";

export class Circle extends Shape {

	radius: number;
	
	constructor(radius: number) {
		super();
		this.radius = radius;
	}

	clone(): Circle {
		return new Circle(this.radius);
	}

	override draw(ctx: CanvasRenderingContext2D, x: number = 0, y: number = 0,) {
		ctx.beginPath();
		ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
		ctx.closePath();
		super.draw(ctx, x, y);
	}

}