import { ChangeDetectionStrategy, Component, ElementRef, QueryList, signal, ViewChild, ViewChildren } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import AnimationManager from "../utils/animationManager";
import Event from "../utils/event";
import { PartInput } from "../components/part-input";
/**
 * Handles loading, configuring, and rendering a customizable character 
 * on an HTML canvas. Supports changing body parts (cosmetics), applying
 * color tint, and animating sprite sheet elements.
 */
@Component({
    selector: "character-editor",
    templateUrl: "./character-editor.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PartInput],
})
export class CharacterEditor {
    protected readonly title = signal("Character Editor");
    @ViewChild('canvas', { static: false }) 
    canvasRef!: ElementRef<HTMLCanvasElement>;
    #canvas!: HTMLCanvasElement;
    #ctx!: CanvasRenderingContext2D;
    @ViewChildren(PartInput)
    parts!: QueryList<PartInput>;

    /**
     * Stores different character parts, each managed by an AnimationManager.
     * Each AnimationManager handles sprite sheet animations for that part.
     */
    #parts = new Map([
       ["noseShape", new AnimationManager("/img/SpriteSheets/noseShapes.png", 4, 3)],
       ["headwear", new AnimationManager("/img/SpriteSheets/headwear.png", 4, 2)],
       ["eyeShape", new AnimationManager("/img/SpriteSheets/eyeShapes.png", 4, 1)],
       ["clothing", new AnimationManager("/img/SpriteSheets/clothing.png", 4, 1)],
       ["mouthShape", new AnimationManager("/img/SpriteSheets/mouthShapes.png", 4, 2)],
    ]);

    /** @type {ImageBitmap}  Body image (base character shape) */
    #body: ImageBitmap = null!;

    /** @type {ImageBitmap}  Shell image (outline for tinting) */
    #shell: ImageBitmap = null!;

    /** 
     * @type {Map<string, string[]>} 
     * Cosmetic data loaded from JSON file (e.g., part names, options)
     */
    #cosmetics: Map<string, string[]> = new Map();

    /**
     * @type {Map<string, ImageBitmap|null>} 
     * Currently selected images for each cosmetic category.
     */
    #character: Map<string, ImageBitmap | null> = new Map();

    /** Event triggered when all assets are loaded */
    #load = new Event();

    /** Current tint color applied to the character */
    #color = "white";

    ngAfterViewInit() {
        this.#canvas = this.canvasRef.nativeElement;
        this.#canvas.height = 112;
        this.#canvas.width = 112;
        this.#ctx = this.#canvas.getContext("2d")!;
        this.main();

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
        this.#color = document.querySelector<HTMLInputElement>("input[type='color']")!.value;
    }

    /**
     * Loads all required asynchronous resources (images and data).
     * Invokes the load event once everything is ready.
     *
     * @async
     * @returns {Promise<void>} 
     */
    async #loadContent(): Promise<void> {
        await Promise.all([
            this.#loadBody(),
            this.#loadCosmetics(),
            this.#loadShell()
        ]);

        // Initialize character parts as null placeholders
        Array.from(this.#cosmetics.keys()).forEach(k => this.#character.set(k, null));

        // Create sprite animations for each cosmetic category
        Array.from(this.#cosmetics.keys()).forEach(this.#createParts.bind(this));

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
        image.src = "/img/body.png";
        await image.decode();
        this.#body = await createImageBitmap(image);
    }

    /**
     * Loads the character's shell (outline used for color tinting).
     * @async
     */
    async #loadShell() {
        const image = new Image();
        image.src = "/img/shell.png";
        await image.decode();
        this.#shell = await createImageBitmap(image);
    }
    
    /**
     * Loads cosmetic options (names and variants) from a JSON file.
     * Stores the data in the #cosmetics map.
     * @async
     */
    async #loadCosmetics() {
        const response = await fetch("/data/cosmetics.json");
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
        const labels: NodeListOf<HTMLLabelElement> = document.querySelectorAll("#app .input-group-text");
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
        const color: HTMLInputElement = document.querySelector("input[type='color']")!;
        color.addEventListener("change", () => {
            this.#color = color.value;
        });

        this.parts.forEach(part => {
            const parts = Array.from(this.#parts.get(part.id)!.animations.keys());
            const options: Map<number, string> = new Map();
            parts.forEach(p => {
                options.set(Number(p), this.#cosmetics.get(part.id)![Number(p)]);
            });
            part.options.set(options);
            part.change.add((p) => {
                const part = this.#parts.get(p.id);
                if (part !== undefined && part.animations.has(p.value!))
                    part.play(p.value!);
                else
                    this.#character.set(p.id, null);
            })
        });

        // document.querySelectorAll(".input.join-item").forEach(input => {
        //     const sel = input.querySelector("select");

        //     Handle color picker input
            

        //     Handle reset buttons for part selectors
        //     const buttons = input.querySelectorAll("button");
        //     buttons.forEach(b => {
        //         b.addEventListener("click", () => {
        //             sel.selectedIndex = 0;
        //             this.#character.set(input.id, null);
        //         });
        //     });

        //     Populate dropdown options for this category
        //     const parts = Array.from(this.#parts.get(input.id)!.animations.keys());
        //     parts.forEach((v) => {
        //         const option = document.createElement("option");
        //         option.value = v;
        //         option.text = this.#cosmetics.get(input.id)![Number(v)];
        //         sel.append(option);
        //     });

        //     Update displayed part when selection changes
        //     sel.addEventListener("change", () => {
        //         const part = this.#parts.get(input.id);
        //         if (part !== undefined && part.animations.has(sel.value))
        //             part.play(sel.value);
        //         else
        //             this.#character.set(input.id, null);
        //     })
        // });
    }

    /**
     * Creates animation instances for each cosmetic option
     * within a specific category (e.g., eye shapes, clothing).
     * @param {string} category - The category name.
     */
    #createParts(category: string) {
        for (let i = 0; i < this.#cosmetics.get(category)!.length; i++) {
            this.#parts.get(category)!.createAnimation(i.toString(), 1, i, i);
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
        const ctx = this.#ctx!;
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