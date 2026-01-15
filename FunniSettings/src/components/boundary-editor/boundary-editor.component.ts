import { ChangeDetectionStrategy, Component, signal,ElementRef, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { Rectangle } from '../../utils/Rectangle';
import { Vector } from '../../utils/Vector';
import { Boundary } from "../boundary/boundary.component";
import { ɵEmptyOutletComponent } from "@angular/router";

/**
 * Input for containing commands
 */
@Component({
    selector: "boundary-editor",
    templateUrl: "./boundary-editor.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ɵEmptyOutletComponent], 
})
export class BoundaryEditor {
	boundaries: Boundary[] = [];
	boundary: Boundary|null = null;
	@ViewChild("boundaryContainer", {read: ViewContainerRef})
	boundaryContainer!: ViewContainerRef;
	anchor = new Vector();

	ngAfterViewInit() {
		window.addEventListener("mousedown", this.#startBoundary.bind(this));
		window.addEventListener("mouseup", this.#validateBoundary.bind(this));
		window.addEventListener("mousemove", this.#resizeBoundary.bind(this));
	}

	#validateBoundary(event: MouseEvent) {
		if (this.boundary != null) {
			this.boundaries.push(this.boundary);
			this.boundary = null;
		}
	}

	#startBoundary(event: MouseEvent) {
		if (event.button == 0) {
			const comp = this.boundaryContainer.createComponent(Boundary);
			this.boundary = comp.instance;

			this.anchor = new Vector(event.x, event.y);

			this.boundary.position = this.anchor.clone();
			this.boundary.width = 0;
			this.boundary.height = 0;
		}
	}

	#resizeBoundary(event: MouseEvent) {
		if (!this.boundary) return;

		const mouse = new Vector(event.x, event.y);

		const x = Math.min(this.anchor.x, mouse.x);
		const y = Math.min(this.anchor.y, mouse.y);
		const w = Math.abs(mouse.x - this.anchor.x);
		const h = Math.abs(mouse.y - this.anchor.y);

		this.boundary.position = new Vector(x, y);
		this.boundary.width = w;
		this.boundary.height = h;
		this.boundary.update();
	}


}