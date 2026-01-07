import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { EventHandler } from "../../utils/EventHandler";

/**
 */
@Component({
    selector: "command-input",
    templateUrl: "./command-input.html",
    changeDetection: ChangeDetectionStrategy.OnPush, 
	imports: [FormsModule],
})
export class CommandInput {
	value = signal("");

	@ViewChild("input")
	inputRef!: ElementRef<HTMLInputElement>;

	execute = new EventHandler<CommandInput>();

	copy() {
		const input = this.inputRef.nativeElement;
		input.select();
		input.setSelectionRange(0, this.value.length);
		navigator.clipboard.writeText(input.value);
	}

	onexecute() {
		this.execute.invoke(this);
	}

}
