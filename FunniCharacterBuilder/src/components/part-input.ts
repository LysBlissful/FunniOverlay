import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import AnimationManager from "../utils/animationManager";
import CustomEvent from "../utils/event";

type PartOption = {value: number, text: string}

/**
 */
@Component({
    selector: "part-input",
    templateUrl: "./part-input.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartInput {
	@Input()
	title!: string;
	@Input()
	id!: string;
	options = signal<Map<number, string>>(new Map());
	change = new CustomEvent<PartInput, null>();
	value: string|null = null;
	onchange(event: Event) {
		this.value = (event.target as HTMLSelectElement).selectedOptions[0].value;
		this.change.invoke(this);
	}
}