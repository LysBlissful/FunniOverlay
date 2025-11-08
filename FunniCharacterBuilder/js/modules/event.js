/** @template T, U */
export default class Event {


    /** @type {((obj: T, args: U?) => void)[]} */
    #eventListeners = [];

    /**
     * Invokes all registered event listeners.
     *
     * @param {T} obj - The object that triggered the event.
     * @param {U} [args=null] - Additional event data (optional).
     */
    invoke(obj, args = null) {
        if (this.#eventListeners.length > 0) {
            for (const eventListener of this.#eventListeners) {
                eventListener(obj, args);
            }
        }
    }

    /**
     * Adds one or more event listeners to the event.
     *
     * @param {...((obj: T, args: U?) => void)} items - The event listeners to add.
     */
    add(...items) {
        for (const eventListener of items) {
            this.#eventListeners.push(eventListener);
        }
    }

    /**
     * Removes one or more event listeners.
     *
     * @param {...(obj: T, args: U?) => void} items - The event listeners to remove.
     */
    remove(...items) {
        this.#eventListeners = this.#eventListeners.filter(listener => !items.includes(listener));
    }

    /**
     * Removes an event listener at the specified index.
     *
     * @param {number} index - The index of the event listener to remove.
     */
    removeAt(index) {
        if (index >= 0 && index < this.#eventListeners.length) {
            this.#eventListeners.splice(index, 1);
        }
    }

    /** Removes all event listeners. */
    clear() {
        this.#eventListeners = [];
    }

    /**
     * Checks if the specified listener is registered.
     *
     * @param {(obj: T, args: U?) => void} listener - The event listener to check for.
     * @returns {boolean} `true` if the listener exists, otherwise `false`.
     */
    has(listener) {
        return this.#eventListeners.includes(listener);
    }
}