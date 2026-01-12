import { ChangeDetectionStrategy, Component, ElementRef, QueryList, signal, ViewChild, ViewChildren } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AnimationManager } from "../utils/AnimationManager";
import { EventHandler } from "../utils/EventHandler";
import { PartInput } from "../components/part-input/part-input";
import { CommandInput } from "../components/command-input/command-input";

type PartStorageItem = {
    free: AnimationManager|null,
    premium: AnimationManager|null
};

type CosmeticStorageItem = { 
    free: {id: string, name: string, frames: number[]}[], 
    premium: {id: string, name: string, frames: number[]}[] 
};
/**
 * Handles loading, configuring, and rendering a customizable character 
 * on an HTML canvas. Supports changing body parts (cosmetics), applying
 * color tint, and animating sprite sheet elements.
 */
@Component({
    selector: "character-editor",
    templateUrl: "./character-editor.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PartInput, CommandInput],
})
export class CharacterEditor {
    protected readonly title = signal("Character Editor");
    @ViewChild('canvas', { static: false }) 
    canvasRef!: ElementRef<HTMLCanvasElement>;
    #canvas!: HTMLCanvasElement;
    #ctx!: CanvasRenderingContext2D;
    @ViewChildren(PartInput)
    parts!: QueryList<PartInput>;

    @ViewChild(CommandInput)
    commandInput!: CommandInput;

    /**
     * Stores different character parts, each managed by an AnimationManager.
     * Each AnimationManager handles sprite sheet animations for that part.
     */
    #partsStorage = new Map<string, PartStorageItem>([
       ["noseShape", null!],
       ["headwear", null!],
       ["headwear", null!],
       ["eyeShape", null!],
       ["clothing", null!],
       ["mouthShape", null!],
    ]);

    /** @type {ImageBitmap}  Body image (base character shape) */
    #body: ImageBitmap = null!;

    /** @type {ImageBitmap}  Shell image (outline for tinting) */
    #shell: ImageBitmap = null!;

    /** 
     * Cosmetic data loaded from JSON file (e.g., part names, options)
     */
    #cosmetics: Map<string, CosmeticStorageItem> = new Map();

    /**
     * @type {Map<string, ImageBitmap|null>} 
     * Currently selected images for each cosmetic category.
     */
    #character: Map<string, ImageBitmap | null> = new Map();

    /** Event triggered when all assets are loaded */
    #load = new EventHandler();

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
        this.commandInput.execute.add(c => console.log(c.value));
        // Initialize color from input element
        this.#color = document.querySelector<HTMLInputElement>("input[type='color']")!.value;
        this.#generateCommand();
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
            this.#loadPartsStorage(),
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

    async #loadPartsStorage() {
        const response = await fetch("/data/spritesheets.json");
        const parts = await response.json();
        for (const part of parts) {
            const options: PartStorageItem = {free: null, premium: null};
            if (part.free != null)
                options.free = new AnimationManager(`/img/SpriteSheets/${part.free.src}`, part.free.hFrames, part.free.vFrames)
            if (part.premium != null)
                options.premium = new AnimationManager(`/img/SpriteSheets/${part.premium.src}`, part.premium.hFrames, part.premium.vFrames)
            this.#partsStorage.set(part.id, {
                free: options.free,
                premium: options.premium
            })
        }
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
        console.log(this.#cosmetics);
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
            this.#generateCommand();
        });

        this.parts.forEach(part => {
            const partStorageItem = this.#partsStorage.get(part.id)!;
            const cosmeticStorageItem = this.#cosmetics.get(part.id)!;
            if (partStorageItem.free != null) {
                this.#setupParts(part, partStorageItem.free, cosmeticStorageItem.free)
            }
            if (partStorageItem.premium != null) {
                this.#setupParts(part, partStorageItem.premium, cosmeticStorageItem.premium)
            }
        });
    }

    #setupParts(input: PartInput, parts: AnimationManager, cosmetics: {id: string, name: string, frames: number[]}[]) {
        const options: Map<string, string> = new Map();
        const partsIds = Array.from(parts.animations.keys());
        const mappedCosmetics = new Map<string, {id: string, name: string, frames: number[]}>();
        cosmetics.forEach(c => mappedCosmetics.set(c.id, c));
        partsIds.forEach(p => {
            options.set(p, mappedCosmetics.get(p)!.name);
        });
        input.options.set(options);
        input.change.add((p) => {
            if (parts.animations.has(p.value!))
                parts.play(p.value!);
            else
                this.#character.set(p.id, null);
            this.#generateCommand();
        });
        input.clear.add((p) => {
            this.#generateCommand();
            this.#partsStorage.get(p.id)!.free?.stop();
            this.#partsStorage.get(p.id)!.premium?.stop();
            this.#character.set(p.id, null);
        })
    }


    /**
     * Creates animation instances for each cosmetic option
     * within a specific category (e.g., eye shapes, clothing).
     * @param {string} category - The category name.
     */
    #createParts(category: string) {
        const cosmeticsStorage = this.#cosmetics.get(category)!;
        const partsStorageItem = this.#partsStorage.get(category)!;
        for (let i = 0; i < cosmeticsStorage.free.length; i++) {
            const frames = cosmeticsStorage.free[i].frames; 
            const start = frames[0];
            const end = frames.length > 1 ? frames[1] : start;
            partsStorageItem.free!.createAnimation(cosmeticsStorage.free[i].id, 4, start, end, true);
        }
        for (let i = 0; i < cosmeticsStorage.premium.length; i++) {
            const frames = cosmeticsStorage.premium[i].frames; 
            const start = frames[0];
            const end = frames.length > 1 ? frames[1] : start;
            partsStorageItem.premium!.createAnimation(cosmeticsStorage.premium[i].id, 4, start, end, true);
        }
    }

    /**
     * Sets up listeners for frame changes in animations,
     * ensuring the #character map stays up-to-date with
     * the current frame’s sprite image.
     */
    #setPartsEvents() {
        this.#partsStorage.forEach((pi, k) => {
            pi.free?.frameChange.add((a) => {
                this.#character.set(k, a.sprite);
            });
            pi.premium?.frameChange.add((a) => {
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

    #generateCommand() {
        let command = `!funni changecolor|${this.#convertToRgb(this.#color)}&`;
        const partNames: string[] = [];
        this.parts.forEach(part => {
            const index = part.selectedIndex() - 1;
            if (index >= 0) {
                const partName = Array.from(part.options().keys())[index];
                partNames.push(`equipcosmetic|${partName}`);
            }
        })
        this.commandInput.value.set(command + partNames.join("&"));
        console.log(this.commandInput.value);   
    }

    #convertToRgb(hex: string) {
        const parsed = hex.replace('#', '');
        const r = parseInt(parsed.substring(0, 2), 16); 
        const g = parseInt(parsed.substring(2, 4), 16); 
        const b = parseInt(parsed.substring(4, 6), 16);
        return `${r},${g},${b}`
    }

}