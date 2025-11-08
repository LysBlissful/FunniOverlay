
import AnimationManager from "./modules/animationManager.js";
import Event from "./modules/event.js";

export default class CharacterEditor {
	#canvas = document.querySelector("canvas");;
	#ctx = this.#canvas.getContext("2d");
	#parts = new Map([
	   ["noseShape", new AnimationManager("./img/spriteSheets/noseShapes.png", 4, 3)],
	   ["headwear", new AnimationManager("./img/spriteSheets/headwear.png", 4, 2)],
	   ["eyeShape", new AnimationManager("./img/spriteSheets/eyeShapes.png", 4, 1)],
	   ["clothing", new AnimationManager("./img/spriteSheets/clothing.png", 4, 1)],
	   ["mouthShape", new AnimationManager("./img/spriteSheets/mouthShapes.png", 4, 2)],
	]);
	/** @type {ImageBitmap}  */
	#body;
	/** @type {ImageBitmap}  */
	#shell;
	/** @type {Map<string, string[]>} */
	#cosmetics = new Map();
	/** @type {Map<string, ImageBitmap|null>} */
	#character = new Map();

	/** @type {Event<CharacterEditor, null>} */
	load = new Event();
	
	color = "white";
	constructor() {
		this.#canvas.height = 112;
		this.#canvas.width = 112;
	}
	/** This method is called when the page is loaded */
	main() {
		this.load.add(
			this.#setupOptions.bind(this), 
			() => setInterval(this.draw.bind(this), 1000 / 60)
		);
		this.#setLabelsWidth();
		this.loadContent();
		// @ts-ignore
		this.color = document.querySelector("input[type='color']").value;
	}

	
	/**
	 * This method is for loading all asyncronus data needed.
	 * 
	 * It will invoke the load event 
	 *
	 * @async
	 * @returns {Promise<void>} 
	 */
	async loadContent() {
		await Promise.all([
			this.#loadBody(),
			this.#loadCosmetics(),
			this.#loadShell()
		]);
		this.#cosmetics.keys().forEach(k => this.#character.set(k, null));
		this.#cosmetics.keys().forEach(this.#createParts.bind(this));
		this.#setPartsEvents();
		this.load.invoke(this);
	}
	
	/**
	 * Loads the body image into a ImageBitmap
	 *
	 * @async
	 * @returns {Promise<void>} 
	 */
	async #loadBody() {
		const image = new Image();
		image.src = "./img/body.png";
		await image.decode();
		this.#body = await createImageBitmap(image);
	}

	async #loadShell() {
		const image = new Image();
		image.src = "./img/shell.png";
		await image.decode();
		this.#shell = await createImageBitmap(image);
	}

	
	/**
	 * Loads the cosmetics from the cosmetics json into the cosmetics map
	 *
	 * @async
	 * @returns {Promise<void>} 
	 */
	async #loadCosmetics() {
		const response = await fetch("./data/cosmetics.json");
		const cosmetics = await response.json();
		for (const key in cosmetics) {
			this.#cosmetics.set(key, cosmetics[key]);
		}
	}

	
	/** Sets all labels on the page to be the same size */
	#setLabelsWidth() {
		/** @type {NodeListOf<HTMLLabelElement>} */
		const labels = document.querySelectorAll("#app .input-group-text");
		let maxWidth = 0;

		labels.forEach(label => {
			const width = label.offsetWidth;
			if (width > maxWidth) maxWidth = width;
		});

		labels.forEach(label => {
			label.style.width = `${maxWidth}px`;
		});
	}
	
	#setupOptions() {
		document.querySelectorAll(".input-group.mb-3").forEach(input => {
			const sel = input.querySelector("select");
			if (sel == null) {
				const color = input.querySelector("input");
				if (color.type == "color") {
					color.addEventListener("change", () => {
						this.color = color.value;
					});
				}
				return;
			}
			const buttons = input.querySelectorAll("button");
			buttons.forEach(b => {
				b.addEventListener("click", () => {
					sel.selectedIndex = 0;
					this.#character.set(input.id, null);
				});
			});
			const parts = Array.from(this.#parts.get(input.id).animations.keys());
			parts.forEach((v) => {
				const option = document.createElement("option");
				option.value = v;
				option.text = this.#cosmetics.get(input.id)[Number(v)];
				sel.append(option);
			});
			sel.addEventListener("change", () => {
				const part = this.#parts.get(input.id);
				if (part !== undefined && part.animations.has(sel.value))
					part.play(sel.value);
				else
					this.#character.set(input.id, null);
			})
		});
	}

	#createParts(category) {
		for (let i = 0; i < this.#cosmetics.get(category).length; i++) {
			this.#parts.get(category).createAnimation(i.toString(), 1, i, i);
			console.log(category);
		}
	}

	#setPartsEvents() {
		this.#parts.forEach((a, k) => {
			a.frameChange.add(() => {
				this.#character.set(k, a.sprite);
			})
		})
	}

	draw() {
		const ctx = this.#ctx;
		const canvas = this.#canvas;
		ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		
		ctx.drawImage(this.#shell, 0, 0);
		// Set global blend mode to colorize
		ctx.globalCompositeOperation = 'source-atop';

		// Fill with the tint color
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Reset blend mode to default
		ctx.globalCompositeOperation = 'source-over';

		ctx.drawImage(this.#body, 0, 0);
		this.#character.forEach((p, i) => {
			if(p !== null)
				ctx.drawImage(p, 0, 0);
		})

	}
}