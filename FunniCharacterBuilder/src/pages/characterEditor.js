import AnimationManager from "./utils/animationManager.js";
import Event from "./modules/event.js";

/**
 * Handles loading, configuring, and rendering a customizable character 
 * on an HTML canvas. Supports changing body parts (cosmetics), applying
 * color tint, and animating sprite sheet elements.
 */
export default class CharacterEditor {

	#canvas = document.querySelector("canvas");
	#ctx = this.#canvas.getContext("2d");

	/**
	 * Stores different character parts, each managed by an AnimationManager.
	 * Each AnimationManager handles sprite sheet animations for that part.
	 */
	#parts = new Map([
	   ["noseShape", new AnimationManager("./img/spriteSheets/noseShapes.png", 4, 3)],
	   ["headwear", new AnimationManager("./img/spriteSheets/headwear.png", 4, 2)],
	   ["eyeShape", new AnimationManager("./img/spriteSheets/eyeShapes.png", 4, 1)],
	   ["clothing", new AnimationManager("./img/spriteSheets/clothing.png", 4, 1)],
	   ["mouthShape", new AnimationManager("./img/spriteSheets/mouthShapes.png", 4, 2)],
	]);

	/** @type {ImageBitmap}  Body image (base character shape) */
	#body;

	/** @type {ImageBitmap}  Shell image (outline for tinting) */
	#shell;

	/** 
	 * @type {Map<string, string[]>} 
	 * Cosmetic data loaded from JSON file (e.g., part names, options)
	 */
	#cosmetics = new Map();

	/**
	 * @type {Map<string, ImageBitmap|null>} 
	 * Currently selected images for each cosmetic category.
	 */
	#character = new Map();

	/** Event triggered when all assets are loaded */
	#load = new Event();

	/** Current tint color applied to the character */
	#color = "white";

	// === Constructor ===
	constructor() {
		this.#canvas.height = 112;
		this.#canvas.width = 112;
	}

	/** 
	 * Entry point for initializing the editor.
	 * Called when the page finishes loading.
	 */
	main() {
		// Add setup and draw callbacks to the load event
		this.#load.add(
			this.#setupOptions.bind(this), 
			() => setInterval(this.#draw.bind(this), 1000 / 60) // 60 FPS draw loop
		);

		// Ensure UI label alignment and start asset loading
		this.#setLabelsWidth();
		this.#loadContent();

		// Initialize color from input element
		// @ts-ignore
		this.#color = document.querySelector("input[type='color']").value;
	}

	/**
	 * Loads all required asynchronous resources (images and data).
	 * Invokes the load event once everything is ready.
	 *
	 * @async
	 * @returns {Promise<void>} 
	 */
	async #loadContent() {
		await Promise.all([
			this.#loadBody(),
			this.#loadCosmetics(),
			this.#loadShell()
		]);

		// Initialize character parts as null placeholders
		this.#cosmetics.keys().forEach(k => this.#character.set(k, null));

		// Create sprite animations for each cosmetic category
		this.#cosmetics.keys().forEach(this.#createParts.bind(this));

		// Bind update events for parts
		this.#setPartsEvents();

		// Notify all load listeners
		this.#load.invoke(this);
	}
	
	/**
	 * Loads the body base image and converts it to an ImageBitmap.
	 * @async
	 */
	async #loadBody() {
		const image = new Image();
		image.src = "./img/body.png";
		await image.decode();
		this.#body = await createImageBitmap(image);
	}

	/**
	 * Loads the character's shell (outline used for color tinting).
	 * @async
	 */
	async #loadShell() {
		const image = new Image();
		image.src = "./img/shell.png";
		await image.decode();
		this.#shell = await createImageBitmap(image);
	}
	
	/**
	 * Loads cosmetic options (names and variants) from a JSON file.
	 * Stores the data in the #cosmetics map.
	 * @async
	 */
	async #loadCosmetics() {
		const response = await fetch("./data/cosmetics.json");
		const cosmetics = await response.json();
		for (const key in cosmetics) {
			this.#cosmetics.set(key, cosmetics[key]);
		}
	}

	/**
	 * Ensures all UI labels in the editor have the same width.
	 * Makes the layout visually consistent.
	 */
	#setLabelsWidth() {
		/** @type {NodeListOf<HTMLLabelElement>} */
		const labels = document.querySelectorAll("#app .input-group-text");
		let maxWidth = 0;

		// Find widest label
		labels.forEach(label => {
			const width = label.offsetWidth;
			if (width > maxWidth) maxWidth = width;
		});

		// Apply uniform width
		labels.forEach(label => {
			label.style.width = `${maxWidth}px`;
		});
	}
	
	/**
	 * Initializes all UI elements (selectors, buttons, color pickers)
	 * and connects them to their respective character parts.
	 */
	#setupOptions() {
		document.querySelectorAll(".input-group.mb-3").forEach(input => {
			const sel = input.querySelector("select");

			// Handle color picker input
			if (sel == null) {
				const color = input.querySelector("input");
				if (color.type == "color") {
					color.addEventListener("change", () => {
						this.#color = color.value;
					});
				}
				return;
			}

			// Handle reset buttons for part selectors
			const buttons = input.querySelectorAll("button");
			buttons.forEach(b => {
				b.addEventListener("click", () => {
					sel.selectedIndex = 0;
					this.#character.set(input.id, null);
				});
			});

			// Populate dropdown options for this category
			const parts = Array.from(this.#parts.get(input.id).animations.keys());
			parts.forEach((v) => {
				const option = document.createElement("option");
				option.value = v;
				option.text = this.#cosmetics.get(input.id)[Number(v)];
				sel.append(option);
			});

			// Update displayed part when selection changes
			sel.addEventListener("change", () => {
				const part = this.#parts.get(input.id);
				if (part !== undefined && part.animations.has(sel.value))
					part.play(sel.value);
				else
					this.#character.set(input.id, null);
			})
		});
	}

	/**
	 * Creates animation instances for each cosmetic option
	 * within a specific category (e.g., eye shapes, clothing).
	 * @param {string} category - The category name.
	 */
	#createParts(category) {
		for (let i = 0; i < this.#cosmetics.get(category).length; i++) {
			this.#parts.get(category).createAnimation(i.toString(), 1, i, i);
			console.log(category);
		}
	}

	/**
	 * Sets up listeners for frame changes in animations,
	 * ensuring the #character map stays up-to-date with
	 * the current frame’s sprite image.
	 */
	#setPartsEvents() {
		this.#parts.forEach((a, k) => {
			a.frameChange.add(() => {
				this.#character.set(k, a.sprite);
			});
		});
	}

	/**
	 * Renders the character onto the canvas.
	 * Handles layering, tint color, and all selected parts.
	 */
	#draw() {
		const ctx = this.#ctx;
		const canvas = this.#canvas;

		// Clear previous frame
		ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		
		// Draw shell for tinting
		ctx.drawImage(this.#shell, 0, 0);

		// Apply color tint using blend mode
		ctx.globalCompositeOperation = 'source-atop';
		ctx.fillStyle = this.#color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Restore normal drawing mode
		ctx.globalCompositeOperation = 'source-over';

		// Draw body and cosmetic layers
		ctx.drawImage(this.#body, 0, 0);
		this.#character.forEach((p) => {
			if (p !== null)
				ctx.drawImage(p, 0, 0);
		});
	}
}
