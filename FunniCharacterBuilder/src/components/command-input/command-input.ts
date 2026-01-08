import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, ViewChild } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { EventHandler } from "../../utils/EventHandler";

/**
 * Input for containing commands
 */
@Component({
    selector: "command-input",
    templateUrl: "./command-input.html",
    changeDetection: ChangeDetectionStrategy.OnPush, 
	imports: [FormsModule],
})
export class CommandInput {
	/** Text inside the input */
	value = signal("");

	/** Reference for the input containing the command */
	@ViewChild("input")
	inputRef!: ElementRef<HTMLInputElement>;

	/** Event for when the execute button is pressed */
	readonly execute = new EventHandler<CommandInput>();

	/** Copies the current text in the input into user's clipboard */
	copy() {
		const input = this.inputRef.nativeElement;
		input.select();
		input.setSelectionRange(0, this.value.length);
		navigator.clipboard.writeText(input.value);
	}

	/** Invokes the {@link execute} {@link EventHandler} */
	onexecute() {
		this.execute.invoke(this);
	}
}
