import { Circle } from "../shapes/Circle.js";
import { Rectangle } from "../shapes/Rectangle.js";
import { Collider } from "./Collider.js";
import { Vector } from "./Vector.js";

export class World extends Array<Collider> {

	gravity: Vector;
	#activeCollisions: Set<string>;
	#deltaTime: number;

	constructor(gravity = new Vector(0, 2), ...colliders: Collider[]) {
		super(...colliders);
		this.gravity = gravity;
		this.#activeCollisions = new Set<string>();
		this.#deltaTime = 1;
	}

	update(deltaTime: number = 1) {
		this.#deltaTime = deltaTime;
		const colliders = this.filter(c => c.type !== "static");
		for (const collider of colliders) {
			collider.velocity.add(this.gravity);
			collider.update(deltaTime);
		}
		this.#checkCollisions();
	}

	remove(...items: Collider[]) {
		for (const collider of items) {
			const index = this.indexOf(collider); 
			if (index >= 0)
				this.splice(index, 1);
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		for (const collider of this) {
			collider.draw(ctx);
		}
	}

	#checkCollisions() {
		const checkedColliders: Collider[] = [];
		const currentFrame = new Set<string>();

		for (let i = 0; i < this.length; i++) {
			const a = this[i];
			for (let j = i + 1; j < this.length; j++) {
				const b = this[j];
				const key = this.#getPairKey(a, b);
				if (checkedColliders.includes(b))
					continue;
				if (a.collides(b)) {
					currentFrame.add(key);
					if (a.type !== "transparent" && b.type !== "transparent")
						this.#resolveCollision(a, b);
					if (!this.#activeCollisions.has(key)) {
						a.oncollide(b);
						b.oncollide(a);
					}
				}
			}
			checkedColliders.push(a);
		}
		this.#activeCollisions = currentFrame;
	}

	#getPairKey(a: Collider, b: Collider): string {
		const idA = this.indexOf(a);
		const idB = this.indexOf(b);
		return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
	}

	#resolveCollision(a: Collider, b: Collider) {
		if (a.shape instanceof Circle) {
			if (b.shape instanceof Circle)
				this.#resolveCircleCollision(a, b);
			else if (b.shape instanceof Rectangle)
				this.#resolveCircleRectCollision(a, b);
		}
		else if (a.shape instanceof Rectangle) {
			if (b.shape instanceof Rectangle)
				this.#resolveRectCollision(a, b);
			else if (b.shape instanceof Circle)
				this.#resolveCircleRectCollision(b, a);
		}
	}

	#resolveCircleCollision(a: Collider, b: Collider) {
		const d = new Vector(a.x - b.x, a.y - b.y);
		const distance = d.magnitude()
		const shapeA = a.shape as Circle;
		const shapeB = b.shape as Circle;
		const overlap = (shapeA.radius + shapeB.radius) - distance;
		if (overlap > 0) {
			const normal = new Vector(d.x / distance, d.y / distance);

			a.x += normal.x * (overlap / 2);
			a.y += normal.y * (overlap / 2);
			b.x -= normal.x * (overlap / 2);
			b.y -= normal.y * (overlap / 2);

			const relative = a.velocity.substracted(b.velocity);
			const velAlongNormal = relative.x * normal.x + relative.y * normal.y;

			if (velAlongNormal < 0) {
				const restitution = 0.5;
				const impulse = -(1 + restitution) * velAlongNormal / 2;
				a.velocity.add(normal.multiplied(impulse));
				b.velocity.subtract(normal.multiplied(impulse));
			}
		}
	}

	#resolveRectCollision(a: Collider, b: Collider) {
		const rectA = a.shape as Rectangle;
		const rectB = b.shape as Rectangle;

		const halfWidthA = rectA.width / 2;
		const halfHeightA = rectA.height / 2;
		const halfWidthB = rectB.width / 2;
		const halfHeightB = rectB.height / 2;


		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const overlap = new Vector(halfWidthA + halfWidthB - Math.abs(dx), halfHeightA + halfHeightB - Math.abs(dy));
		if (overlap.x > 0 && overlap.y > 0) {
			if (overlap.x < overlap.y) {
				const normal = new Vector(Math.sign(dx), 0);

				a.x += normal.x * (overlap.x / 2);
				b.x -= normal.x * (overlap.x / 2);

				const relative = a.velocity.substracted(b.velocity);
				const velAlongNormal = relative.x * normal.x + relative.y * normal.y;

				if (velAlongNormal < 0) {
					const restitution = 0.5;
					const impulse = -(1 + restitution) * velAlongNormal / 2;
					a.velocity.add(normal.multiplied(impulse));
					b.velocity.subtract(normal.multiplied(impulse));
				}
			} else {
				const normal = new Vector(0, Math.sign(dy));

				a.y += normal.y * (overlap.y / 2);
				b.y -= normal.y * (overlap.y / 2);

				const relative = a.velocity.substracted(b.velocity);
				const velAlongNormal = relative.x * normal.x + relative.y * normal.y;

				if (velAlongNormal < 0) {
					const restitution = 0.5;
					const impulse = -(1 + restitution) * velAlongNormal / 2;
					a.velocity.add(normal.multiplied(impulse));
					b.velocity.subtract(normal.multiplied(impulse));
				}
			}
		}
	}

	#resolveCircleRectCollision(circleCollider: Collider, rectCollider: Collider) {
		const circle = circleCollider.shape as Circle;
		const rect = rectCollider.shape as Rectangle;

		// Step 1: Find closest point on rectangle to circle center
		const closestX = Math.max(
			rectCollider.x,
			Math.min(circleCollider.x, rectCollider.x + rect.width)
		);
		const closestY = Math.max(
			rectCollider.y,
			Math.min(circleCollider.y, rectCollider.y + rect.height)
		);

		// Step 2: Vector from closest point to circle center
		const d = new Vector(circleCollider.x - closestX, circleCollider.y - closestY);
		const distance = d.magnitude() || 0.0001; // avoid division by zero
		const overlap = circle.radius - distance;

		if (overlap > 0) {
			// Step 3: Normalized collision normal
			const normal = new Vector(d.x / distance, d.y / distance);

			// Step 4: Push circle out of rectangle
			circleCollider.x += normal.x * overlap;
			circleCollider.y += normal.y * overlap;

			// Step 5: If rectangle is dynamic, share resolution
			circleCollider.x += normal.x * (overlap / 2);
			circleCollider.y += normal.y * (overlap / 2);
			rectCollider.x -= normal.x * (overlap / 2);
			rectCollider.y -= normal.y * (overlap / 2);

			// Step 6: Relative velocity along normal
			const relative = circleCollider.velocity.substracted(rectCollider.velocity);
			const velAlongNormal = relative.x * normal.x + relative.y * normal.y;

			if (velAlongNormal < 0) {
				const restitution = 0.5; // bounciness
				const impulse = -(1 + restitution) * velAlongNormal;
				circleCollider.velocity.add(normal.multiplied(impulse / 2));
				rectCollider.velocity.subtract(normal.multiplied(impulse / 2));
			}
		}
	}
}