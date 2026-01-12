type PartOptions = {
	id: string,
	name: string,
	frames: number[],
	premium: boolean
}
export class Part {
	id: string;
	name: string;
	frames: number[];
	premium: boolean;
	constructor(options: PartOptions) {
		this.id = options.id;
		this.name = options.name;
		this.frames = options.frames;
		this.premium = options.premium;
	}
}