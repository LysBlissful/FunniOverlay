import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, ViewChild } from "@angular/core";
import { EventHandler } from "../../utils/EventHandler";

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
	options = signal<Map<string, string>>(new Map());
	change = new EventHandler<PartInput>();
	clear = new EventHandler<PartInput>();
	value: string|null = null;
	selectedIndex = signal(0);
	onchange(event: Event) {
		const select = (event.target as HTMLSelectElement);
		this.value = select.selectedOptions[0].value;
		this.selectedIndex.set(select.selectedIndex);
		this.change.invoke(this);
	}

	onclear() {
		this.selectedIndex.set(0);
		this.value = null;
		this.clear.invoke(this);
	}
}