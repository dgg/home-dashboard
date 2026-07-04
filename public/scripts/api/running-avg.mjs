//import {ZonedDateTime} from "temporal-luxon"

export class RunningAvg {
	#count = 0
	#avg
	constructor(avg, count) {
		this.#avg = avg ?? undefined
		this.#count = count ?? 0
	}

	get avg() {
		return this.#avg
	}

	/**
	 *
	 * @param {number} value
	 */
	process(val) {
		if (typeof val !== "number") {
			return
		}

		if (this.#avg === undefined) {
			this.#avg = val
		} else {
			this.#avg = this.#avg + (val - this.#avg) / (this.#count + 1)
		}
		this.#count++
	}
}
