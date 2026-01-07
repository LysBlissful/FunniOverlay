import { EventHandler } from "./EventHandler.js";
import { SpriteAnimation } from "./SpriteAnimation.js";
import { Timer } from "./Timer.js";

export class AnimationManager {
	#animation: SpriteAnimation;
	#flip: boolean = false;
	#loaded: boolean = false;
	spriteSheet: HTMLImageElement;
	animations: Map<string, SpriteAnimation>;
	frames: ImageBitmap[];
	flippedFrames: ImageBitmap[];
	sprite: ImageBitmap | null;
	timer: Timer;
	hFrames: number;
	vFrames: number;
	load: EventHandler<AnimationManager> = new EventHandler();
	start: EventHandler<AnimationManager> = new EventHandler();
	end: EventHandler<AnimationManager> = new EventHandler();
	frameChange: EventHandler<AnimationManager> = new EventHandler();

	get loaded() { return this.#loaded; }

	/** Whether an animation is playing */
	get playing() {
		return this.#animation?.playing ?? false;
	}

	/** The name of the currently playing animation */
	get animation() {
		for (const [key, anim] of this.animations) {
			if (anim === this.#animation) return key;
		}
		return null;
	}

	/** Current frame index in the animation */
	get frame() {
		return this.#animation?.frame ?? 0;
	}
	set frame(value) {
		if (this.#animation) this.#animation.frame = value;
	}

	/** Whether the current sprite should be horizontally flipped */
	get flip() {
		return this.#flip;
	}
	set flip(value) {
		this.#flip = value;
		if(this.animation !== null){
			const frameIndex = this.#animation.frames[this.#animation.frame];
			if(this.#flip)
				this.sprite = this.flippedFrames[frameIndex]
			else 
				this.sprite = this.frames[frameIndex];
			this.onframeChange();
		}
	}

	/**
	 * Creates an instance of AnimationManager.
	 * @param {string} src Path to the sprite sheet image
	 * @param {number} hFrames Number of frames horizontally
	 * @param {number} vFrames Number of frames vertically
	 */
	constructor(src: string, hFrames: number, vFrames: number) {
		this.hFrames = hFrames;
		this.vFrames = vFrames;
		this.animations = new Map();
		this.frames = [];
		this.flippedFrames = [];
		this.sprite = null;
		this.#animation = null!;

		this.timer = new Timer();
		this.timer.tick.add(this.#onTimerTick);

		this.spriteSheet = new Image();
		this.spriteSheet.onload = async () => {
			await this.#drawFrames();
			this.#loaded = true;
			this.load.invoke(this);
		};
		this.spriteSheet.src = src;
	}

	/** Internal update function for frame timing */
	#onTimerTick = async () => {
		const frameIndex = this.#animation.frames[this.#animation.frame];
		if(this.#flip)
			this.sprite = this.flippedFrames[frameIndex]
		else 
			this.sprite = this.frames[frameIndex];

		this.onframeChange();

		this.#animation.frame++;
		if (this.#animation.frame >= this.#animation.frames.length) {
			if (!this.#animation.loop) {
				this.stop();
				return;
			}
			this.#animation.frame = 0;
		}
	};

	/** Triggered when the current frame changes */
	onframeChange() {
		this.frameChange.invoke(this);
	}

	/** Triggered when an animation starts */
	onstart() {
		this.start.invoke(this);
	}

	/** Triggered when an animation ends */
	onend() {
		this.end.invoke(this);
	}

	/**
	 * Creates an animation from a range of frames
	 * @param {string} name Animation name
	 * @param {number} fps Frames per second
	 * @param {number} start Start frame index
	 * @param {number} end End frame index
	 * @param {boolean} loop Whether it should loop
	 */
	createAnimation(name: string, fps: number, start: number, end: number, loop: boolean = false) {
		const frames = [];
		for (let i = start; i <= end; i++) {
			frames.push(i);
		}
		this.animations.set(name, new SpriteAnimation(fps, loop, frames));
	}

	/**
	 * Starts playing the given animation by name
	 * @param {string} name Animation name
	 * @throws {Error} If animation doesn't exist
	 */
	play(name: string) {
		if (!this.loaded) {
			this.load.clear();
			this.load.add(() => this.play(name));
			return;
		}
		const animation = this.animations.get(name);
		if (!animation)
			throw new Error(`There's no animation with the name: "${name}"`);

		if (this.#animation === animation && this.playing) return;

		animation.frame = 0;
		this.#animation = animation;
		this.#animation.playing = true;

		this.timer.interval = 1000 / animation.fps;
		this.timer.start();
		this.onstart();
	}

	/** Stops the current animation */
	stop() {
		if (this.#animation) {
			this.#animation.frame = 0;
			this.#animation.playing = false;
		}
		this.timer.stop();
		this.onend();
	}

	/**
	 * Gets number of frames in a given animation
	 * @param {string} name Animation name
	 * @returns {number}
	 */
	getFrameCount(name: string): number {
		const animation = this.animations.get(name);
		if (!animation)
			throw new Error(`There's no animation with the name: "${name}"`);
		return animation.frames.length;
	}

	/** Extracts frames from the sprite sheet */
	async #drawFrames() {
		this.frames = [];
		this.flippedFrames = [];

		const frameWidth = Math.floor(this.spriteSheet.width / this.hFrames);
		const frameHeight = Math.floor(this.spriteSheet.height / this.vFrames);

		const canvas = document.createElement("canvas");
		canvas.width = frameWidth;
		canvas.height = frameHeight;
		const ctx = canvas.getContext("2d")!;

		for (let j = 0; j < this.vFrames; j++) {
			for (let i = 0; i < this.hFrames; i++) {
				const x = i * frameWidth;
				const y = j * frameHeight;

				ctx.clearRect(0, 0, frameWidth, frameHeight);
				ctx.drawImage(
					this.spriteSheet,
					x, y, frameWidth, frameHeight,
					0, 0, frameWidth, frameHeight
				);

				const frame = await createImageBitmap(canvas);
				this.frames.push(frame);

				const flipped = await this.#flipBitmap(frame);
				this.flippedFrames.push(flipped);
			}
		}
	}

	/**
	 * Flips an ImageBitmap horizontally
	 * @param {ImageBitmap} frame Original frame
	 * @returns {Promise<ImageBitmap>} Flipped version
	 */
	async #flipBitmap(frame: ImageBitmap): Promise<ImageBitmap> {
		const canvas = document.createElement("canvas");
		canvas.width = frame.width;
		canvas.height = frame.height;

		const ctx = canvas.getContext("2d")!;
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(frame, -frame.width, 0);
		ctx.restore();

		return await createImageBitmap(canvas);
	}

	/**
	 * Combines the current animation's frames into a single horizontal sprite sheet.
	 * @param {string} name 
	 * @returns {HTMLImageElement} A new image element containing the combined frames.
	 */
	displayFrames(name: string): HTMLImageElement|null {
		if(!this.loaded){
			this.load.add(() => this.displayFrames(name))
			return null;
		}
		const animation = this.animations.get(name)!;
		const frameIndices = animation.frames;
		const firstFrame = this.frames[frameIndices[0]];
		const frameWidth = firstFrame.width;
		const frameHeight = firstFrame.height;
		const totalFrames = frameIndices.length;

		// Create a canvas to hold the sprite sheet
		const canvas = document.createElement("canvas");
		canvas.width = frameWidth * totalFrames;
		canvas.height = frameHeight;
		const ctx = canvas.getContext("2d")!;

		// Draw each frame side-by-side
		for (let i = 0; i < totalFrames; i++) {
			const frame = this.frames[frameIndices[i]];
			ctx.drawImage(frame, i * frameWidth, 0);
		}

		// Convert the canvas to an image
		const image = new Image();
		image.src = canvas.toDataURL("image/png");

		return image;
	}

}
