import { IClonable } from "../utils/IClonable";

type DrawStyle = "fill" | "stroke";

export abstract class Shape implements IClonable {

	#style: DrawStyle = "fill";
	color: string = "red";

	get style() { return this.#style; }
	set style(value) {
		if (value != "fill" && value != "stroke")
			throw new Error(`Invalid style "${this.style}". Use "fill" or "stroke".`);
		this.#style = value;
	}

	abstract clone(): Shape;

	draw(ctx: CanvasRenderingContext2D, x = 0, y = 0) {
		if (this.constructor === Shape)
			throw new Error("You must override draw()");
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		if (this.style === "fill")
			ctx.fill();
		else
			ctx.stroke();

		
		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI);
		ctx.closePath();
		ctx.fillStyle = "yellow";
		ctx.strokeStyle = "yellow";
		if (this.style === "fill")
			ctx.fill();
		else
			ctx.stroke();

	}
}