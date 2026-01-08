import { ChangeDetectionStrategy, Component, signal,ElementRef, ViewChild } from '@angular/core';
import { Rectangle } from '../utils/Rectangle';
import { Vector } from '../utils/Vector';

/**
 * Input for containing commands
 */
@Component({
    selector: "boundary-editor",
    templateUrl: "./boundary-editor.html",
    changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class BoundaryEditor {
	@ViewChild("canvas")
	canvasRef!: ElementRef<HTMLCanvasElement>;
	#ctx!: CanvasRenderingContext2D;
	boundaries: Rectangle[] = [];
	boundary: Rectangle|null = null;
	ngAfterViewInit() {
		const canvas = this.canvasRef.nativeElement;
		canvas.addEventListener("mousedown", this.#startBoundary.bind(this));
		canvas.addEventListener("mouseup", this.#validateBoundary.bind(this));
		canvas.addEventListener("mousemove", this.#resizeBoundary.bind(this));

		this.#ctx = canvas.getContext("2d")!;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		window.addEventListener("resize", e => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		});
		setInterval(() => {
			this.#ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (this.boundary != null)
				this.boundary.draw(this.#ctx);
			this.boundaries.forEach(b => b.draw(this.#ctx))
		});
	}

	#startBoundary(event: MouseEvent) {
		this.boundary = new Rectangle(0, 0);
		this.boundary.position = new Vector(event.x, event.y);
	}

	#validateBoundary(event: MouseEvent) {
		if (this.boundary != null) {
			this.boundaries.push(this.boundary.clone());
			this.boundary = null;
		}
	}

	#resizeBoundary(event: MouseEvent) {
		if (this.boundary != null) {
			this.boundary.width = event.x - this.boundary.position.x;
			this.boundary.height = event.y - this.boundary.position.y;
		}
	}
}