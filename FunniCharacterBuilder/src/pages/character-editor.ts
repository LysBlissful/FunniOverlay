import { ChangeDetectionStrategy, Component, ElementRef, QueryList, signal, ViewChild, ViewChildren } from "@angular/core";
import { AnimationManager } from "../utils/AnimationManager";
import { EventHandler } from "../utils/EventHandler";
import { PartInput } from "../components/part-input/part-input";
import { CommandInput } from "../components/command-input/command-input";
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
    #ctx!: CanvasRenderingContext2D;

    /**
     * Stores different character parts, each managed by an AnimationManager.
     * Each AnimationManager handles sprite sheet animations for that part.
     */
    #partsSprites = new Map([
       ["noseShape", new AnimationManager("/img/SpriteSheets/noseShapes.png", 4, 3)],
       ["headwear", new AnimationManager("/img/SpriteSheets/headwear.png", 4, 2)],
       ["eyeShape", new AnimationManager("/img/SpriteSheets/eyeShapes.png", 4, 1)],
       ["clothing", new AnimationManager("/img/SpriteSheets/clothing.png", 4, 1)],
       ["mouthShape", new AnimationManager("/img/SpriteSheets/mouthShapes.png", 4, 2)],
    ]);

    /** Body image (base character shape) */
    #body: ImageBitmap = null!;

    /** Shell image (outline for tinting) */
    #shell: ImageBitmap = null!;

    /** Cosmetic data loaded from JSON file (e.g., part names, options) */
    #cosmetics: Map<string, string[]> = new Map();

    /** Currently selected images for each cosmetic category.*/
    #character: Map<string, ImageBitmap | null> = new Map();

    /** Event triggered when all assets are loaded */
    #load = new EventHandler<CharacterEditor>();

    /** Current tint color applied to the character */
    #color = "white";

    /** Reference to the canvas in which the egg is drawn */
    @ViewChild('canvas', { static: false }) 
    canvasRef!: ElementRef<HTMLCanvasElement>;

    /** All part inputs of the page */
    @ViewChildren(PartInput)
    parts!: QueryList<PartInput>;

    /** The command input of the page */
    @ViewChild(CommandInput)
    commandInput!: CommandInput;
    

    
    ngAfterViewInit() {
        const canvas = this.canvasRef.nativeElement;
        canvas.height = 112;
        canvas.width = 112;
        this.#ctx = canvas.getContext("2d")!;
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
            () => setInterval(this.#draw.bind(this), 1000 / 24)
        );

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
     * 
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
            const parts = Array.from(this.#partsSprites.get(part.id)!.animations.keys());
            const options: Map<number, string> = new Map();
            parts.forEach(p => {
                options.set(Number(p), this.#cosmetics.get(part.id)![Number(p)]);
            });
            part.options.set(options);
            part.change.add((p) => {
                const part = this.#partsSprites.get(p.id);
                if (part !== undefined && part.animations.has(p.value!))
                    part.play(p.value!);
                else
                    this.#character.set(p.id, null);
                this.#generateCommand();
            });
            part.clear.add((p) => {
                this.#generateCommand();
                this.#character.set(p.id, null);
            })
        });
    }

    /**
     * Creates animation instances for each cosmetic option
     * within a specific category (e.g., eye shapes, clothing).
     * 
     * @param {string} category - The category name.
     */
    #createParts(category: string) {
        for (let i = 0; i < this.#cosmetics.get(category)!.length; i++) {
            this.#partsSprites.get(category)!.createAnimation(i.toString(), 1, i, i);
            console.log(category);
        }
    }

    /**
     * Sets up listeners for frame changes in animations,
     * ensuring the #character map stays up-to-date with
     * the current frame’s sprite image.
     */
    #setPartsEvents() {
        this.#partsSprites.forEach((a, k) => {
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
        const canvas = this.canvasRef.nativeElement;

        // Clear previous frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
    
    /** Generates a command from all character parts */
    #generateCommand() {
        let command = "!funni ";
        const commands: string[] = [`changecolor|${this.#convertToRgb(this.#color)}`];
        this.parts.forEach(part => {
            const index = part.selectedIndex() - 1;
            if (index >= 0) {
                const partName = Array.from(part.options().values())[index];
                commands.push(`equipcosmetic|${partName}`);
            }
        })
        this.commandInput.value.set(command + commands.join("&"));
        console.log(this.commandInput.value);   
    }
    
    /**
     * Converts hex into rgb
     *
     * @param {string} hex 
     * @returns {string} 
     */
    #convertToRgb(hex: string): string {
        const parsed = hex.replace('#', '');
        const r = parseInt(parsed.substring(0, 2), 16); 
        const g = parseInt(parsed.substring(2, 4), 16); 
        const b = parseInt(parsed.substring(4, 6), 16);
        return `${r},${g},${b}`
    }
}