
export class Vector implements IClonable {

	static get PRECISION() { return 1000;}
	static get ZERO() { return new Vector(0, 0); }

	#x!: number;
	#y!: number;

	get x() { return this.#x; }
	set x(value) { this.#x = this.#round(value); }

	get y() { return this.#y; }
	set y(value) { this.#y = this.#round(value); }


	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	#round(value: number): number {
		return Math.round(value * Vector.PRECISION) / Vector.PRECISION;
	}

	equals(v: Vector): boolean {
		return this.x == v.x && this.y == v.y;
	}

	clone(): Vector {
		return new Vector(this.x, this.y);
	}

	add(v: Vector|number) {
		if (v instanceof Vector) {
			this.x += v.x;
			this.y += v.y;
		}
		else {
			this.x += v;
			this.y += v;
		}
	}

	added(v: Vector|number): Vector {
		if (v instanceof Vector) 
			return new Vector(this.x + v.x, this.y + v.y);
		return new Vector(this.x + v, this.y + v);
	}

	subtract(v: Vector|number) {
		if (v instanceof Vector) {
			this.x -= v.x;
			this.y -= v.y;
		}
		else {
			this.x -= v;
			this.y -= v;
		}
	}

	substracted(v: Vector|number): Vector {
		if (v instanceof Vector) 
			return new Vector(this.x - v.x, this.y - v.y);
		return new Vector(this.x - v, this.y - v);
	}

	multiply(v: Vector|number) {
		if (v instanceof Vector) {
			this.x *= v.x;
			this.y *= v.y;
		}
		else {
			this.x *= v;
			this.y *= v;
		}
	}

	multiplied(v: Vector|number): Vector {
		if (v instanceof Vector) 
			return new Vector(this.x * v.x, this.y * v.y);
		return new Vector(this.x * v, this.y * v);
	}

	divide(v: Vector|number) {
		if (v instanceof Vector) {
			this.x /= v.x;
			this.y /= v.y;
		}
		else {
			this.x /= v;
			this.y /= v;
		}
	}

	divided(v: Vector|number): Vector {
		if (v instanceof Vector) 
			return new Vector(this.x / v.x, this.y / v.y);
		return new Vector(this.x / v, this.y / v);
	}

	
	normalize() {
		const mag = this.magnitude();
		if(mag != 0)
			this.multiply(1 / mag);
	}

	
	normalized(): Vector {
		const mag = this.magnitude();
		if(mag != 0)
			return this.multiplied(1 / mag);
		return this.clone();
	}

	magnitude(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	
}