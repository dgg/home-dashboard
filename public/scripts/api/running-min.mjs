// import {ZonedDateTime} from "temporal-luxon"

export class RunningMin {
	#min = -Infinity
	#ts
	constructor(min, ts) {
		this.#min = min ?? -Infinity
		this.#ts = ts ?? undefined
	}

	get min() {
		return this.#min
	}

	get ts() {
		return this.#ts
	}

	/**
	 *
	 * @param {number} value
	 * @param {ZonedDateTime} ts
	 */
	process(val, ts) {
		if (typeof val !== "number") {
			return
		}

		if (!isFinite(this.#min) || val < this.#min){
			this.#min = val
			this.#ts = ts
		}
	}
}
