import Event from "./event.js";
import Timer from "./timer.js";

export default class SpriteAnimation {

	
	/**
	 * Creates an instance of SpriteAnimation.
	 *
	 * @constructor
	 * @param {number} fps 
	 * @param {boolean} loop 
	 * @param {number[]} frames 
	 */
	constructor(fps, loop, frames) {
		this.fps = fps;
		this.loop = loop;
		this.frames = frames;
		this.frame = 0;
		this.playing = false;
	}
	
	/**
	 * Clones the current `SpriteAnimation`.
	 * @returns {SpriteAnimation} A new `SpriteAnimation` instance.
	 */
	clone() {
		return new SpriteAnimation(this.fps, this.loop, this.frames);
	}
}