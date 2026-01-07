export class EventHandler<T, U=void> {

	#eventListeners: ((obj: T, args: U) => void)[] = [];

	invoke(obj: T, args: U) {
		if (this.#eventListeners.length > 0) {
			for (const eventListener of this.#eventListeners) {
				eventListener(obj, args);
			}
		}
	}

	add(...items: ((obj: T, args: U) => void)[]) {
		for (const eventListener of items) {
			this.#eventListeners.push(eventListener);
		}
	}

	remove(...items: ((obj: T, args: U) => void)[]) {
		this.#eventListeners = this.#eventListeners.filter(listener => !items.includes(listener));
	}

	
	removeAt(index: number) {
		if (index >= 0 && index < this.#eventListeners.length) {
			this.#eventListeners.splice(index, 1);
		}
	}

	clear() {
		this.#eventListeners = [];
	}

	has(listener: (obj: T, args: U) => void): boolean {
		return this.#eventListeners.includes(listener);
	}
}