import { EventHandler } from "./EventHandler"
import { IClonable } from "./IClonable";
import { Timer } from "./Timer";

export class SpriteAnimation implements IClonable {

	fps: number;
	loop: boolean;
	frames: number[];
	frame: number;
	playing: boolean;

	constructor(fps: number, loop: boolean, frames: number[]) {
		this.fps = fps;
		this.loop = loop;
		this.frames = frames;
		this.frame = 0;
		this.playing = false;
	}

	clone(): SpriteAnimation {
		return new SpriteAnimation(this.fps, this.loop, this.frames);
	}
	
}