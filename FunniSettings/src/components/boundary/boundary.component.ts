import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, Input, signal } from '@angular/core';
import { Rectangle } from '../../utils/Rectangle';
import { Vector } from '../../utils/Vector';
import { BoundaryMenu } from "../boundary-menu/boundary-menu.component";
import { BoundaryEditor } from "../boundary-editor/boundary-editor.component";

@Component({
    selector: "boundary-component",
    templateUrl: "./boundary.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [BoundaryMenu],
})
export class Boundary {
    #rectangle: Rectangle = new Rectangle(0, 0);
    #menu?: BoundaryMenu;

    @ViewChild("root")
    divRef!: ElementRef<HTMLDivElement>;
    #showMenu = false;
    @ViewChild(BoundaryMenu)
    set menuRef(value: BoundaryMenu | undefined) {
        if (value) {
            this.#menu = value;
            if (this.lastClickPosition != null)
                this.#menu.position.set(this.lastClickPosition);
        }
    }
    private test = signal(0);
    @Input({ required: true })
    get width() { return this.#rectangle.width; }
    set width(value) { this.#rectangle.width = value; }

    @Input({ required: true })
    get height() { return this.#rectangle.height; }
    set height(value) { this.#rectangle.height = value; }

    get position() { return this.#rectangle.position; }
    set position(value) { this.#rectangle.position = value; }
    
    lastClickPosition: Vector|null = null;


    onMouseDown(e: PointerEvent) {
        e.preventDefault();
        this.lastClickPosition = new Vector(e.clientX, e.clientY);
        this.#menu?.show.set(true);
        this.#menu?.position.set(this.lastClickPosition.substracted(10));
    }

    update() {
        const div = this.divRef.nativeElement;
        div.style.top = `${this.position.y}px`;
        div.style.left = `${this.position.x}px`;
        div.style.width = `${this.width}px`;
        div.style.height = `${this.height}px`;

        switch (this.#rectangle.style) {
            case "fill":
                div.style.backgroundColor = this.#rectangle.color;
                div.style.border = "";
                break;
            case "stroke":
                div.style.border = `2px solid ${this.#rectangle.color}`;
                div.style.backgroundColor = "";
                break;
        }
    }
}
