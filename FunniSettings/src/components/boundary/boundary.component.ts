import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, Input } from '@angular/core';
import { Rectangle } from '../../utils/Rectangle';
import { Vector } from '../../utils/Vector';

@Component({
    selector: "boundary-component",
    templateUrl: "./boundary.component.html",
    styleUrl: "./boundary.component.css",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Boundary {
    @ViewChild("div")
    divRef!: ElementRef<HTMLDivElement>;

    #rectangle: Rectangle = new Rectangle(0, 0);

    @Input({ required: true })
    get width() { return this.#rectangle.width; }
    set width(value) {
        this.#rectangle.width = value;
    }

    @Input({ required: true })
    get height() { return this.#rectangle.height; }
    set height(value) {
        this.#rectangle.height = value;
    }

    get position() {
        return this.#rectangle.position;
    }
    set position(value) {
        this.#rectangle.position = value;
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
