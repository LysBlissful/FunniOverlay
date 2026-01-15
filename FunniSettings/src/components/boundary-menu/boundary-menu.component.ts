import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, Input, signal } from '@angular/core';
import { Vector } from '../../utils/Vector';

@Component({
    selector: "boundary-menu",
    templateUrl: "./boundary-menu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoundaryMenu {
	@ViewChild("root")
	root!: ElementRef<HTMLSpanElement>;
	position = signal(new Vector());
	show = signal(false);
	mouseLeft = false;
	
	onMouseEnter() {
		this.mouseLeft = false
	}
	onMouseLeave() {
		this.mouseLeft = false;
		this.show.set(false)
	}

}