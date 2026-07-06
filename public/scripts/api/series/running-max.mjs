// import {ZonedDateTime} from "temporal-luxon"

export class RunningMax {
	#max = Infinity
	#ts
	constructor(max, ts) {
		this.#max = max ?? Infinity
		this.#ts = ts ?? undefined
	}

	get max() { return this.#max }

	get ts() { return this.#ts }

	/**
	 *
	 * @param {number} value
	 * @param {ZonedDateTime} ts
	 */
	process(val, ts) {
		if (typeof val !== "number") {
			return
		}

		if (!isFinite(this.#max) || val > this.#max) {
			this.#max = val
			this.#ts = ts
		}
	}
}
