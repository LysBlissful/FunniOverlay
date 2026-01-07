import { Circle } from "../shapes/Circle";
import { Rectangle } from "../shapes/Rectangle";
import { Shape } from "../shapes/Shape";
import { Vector } from "./Vector";
import { EventHandler } from "../utils/EventHandler";
import { IClonable } from "../utils/IClonable";

/**
 * @typedef {"transparent"|"static"|"dynamic"} ColliderType
 */
type ColliderType = "transparent"|"static"|"dynamic";

export class Collider implements IClonable {
	#position: Vector
	#deltaTime: number = 1;
	#type: ColliderType = "dynamic";

	shape: Shape;
	velocity: Vector;
	collide: EventHandler<Collider, CollideEventArgs>;

	get x() { return this.#position.x; }
	set x(value) {
		if (this.type == "static")
			return;
		this.#position.x = value; 
	}

	get y() { return this.#position.y; }
	set y(value) {
		if (this.type == "static")
			return;
		this.#position.y = value;
	}

	get type() { return this.#type; }
	set type(value) {
		if (value != "dynamic" && value != "static" && value != "transparent")
			throw new Error(`Collider type "${value}" isn't valid`);
		this.#type = value; 
	}
	
	constructor(shape: Shape, x: number = 0, y: number = 0, velocity = Vector.ZERO, type: ColliderType = "dynamic") {
		this.shape = shape;
		this.#position = new Vector(x, y);
		this.velocity = velocity;
		this.collide = new EventHandler();
		this.type = type;
	}

	clone(): Collider {
		return new Collider(this.shape, this.x, this.y, this.velocity.clone(), this.type);
	}
	
	update(deltaTime: number = 1) {
		this.#deltaTime = deltaTime;
		this.#position.add(this.velocity.multiplied(deltaTime));
	}

	oncollide(collider: Collider) {
		this.collide.invoke(this, new CollideEventArgs(collider));
	}

	collides(collider: Collider): boolean {
		if (this.shape instanceof Circle) {
			if (collider.shape instanceof Circle)
				return this.#circleCircleCollision(this, collider);
			if (collider.shape instanceof Rectangle)
				return this.#circleRectCollision(this, collider);
		}
		if (this.shape instanceof Rectangle) {
			if (collider.shape instanceof Rectangle)
				return this.#rectRectCollision(this, collider);
			if (collider.shape instanceof Circle)
				return this.#circleRectCollision(collider, this);
		}
		return false;
	}

	#circleCircleCollision(a: Collider, b: Collider): boolean {
		const dx = a.x - b.x, shapeA = a.shape as Circle;
		const dy = a.y - b.y, shapeB = b.shape as Circle;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance <= shapeA.radius + shapeB.radius;
	}

	#rectRectCollision(a: Collider, b: Collider): boolean {
		const shapeA = a.shape as Rectangle;
		const shapeB = b.shape as Rectangle;

		const ax1 = a.x - shapeA.width / 2, ay1 = a.y - shapeA.height / 2;
		const ax2 = a.x + shapeA.width / 2, ay2 = a.y + shapeA.height / 2;
		const bx1 = b.x - shapeB.width / 2, by1 = b.y - shapeB.height / 2;
		const bx2 = b.x + shapeB.width / 2, by2 = b.y + shapeB.height / 2;
		return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
	}

	#circleRectCollision(c: Collider, r: Collider): boolean {
		const circle = c.shape as Circle;
		const rectangle = r.shape as Rectangle;

		// Rectangle bounds (top-left based)
		const rx1 = r.x;
		const ry1 = r.y;
		const rx2 = r.x + rectangle.width;
		const ry2 = r.y + rectangle.height;

		// Clamp circle center to rectangle bounds
		const closestX = Math.max(rx1, Math.min(c.x, rx2));
		const closestY = Math.max(ry1, Math.min(c.y, ry2));

		// Distance from circle center to closest point
		const dx = c.x - closestX;
		const dy = c.y - closestY;

		return dx * dx + dy * dy <= circle.radius * circle.radius;
	}

	
	draw(ctx: CanvasRenderingContext2D) {
		this.shape.draw(ctx, this.x, this.y);
	}

}

export class CollideEventArgs {
	collider: Collider;

	constructor(collider: Collider) {
		this.collider = collider;
	}
}