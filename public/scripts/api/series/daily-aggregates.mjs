import { RunningMin } from "./running-min.mjs"
import { RunningMax } from "./running-max.mjs"
import { RunningAvg } from "./running-avg.mjs"

const DAY_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
})

/**
 * Running aggregates composite
 */
class Aggregates {
	constructor() {
		this.min = new RunningMin()
		this.max = new RunningMax()
		this.avg = new RunningAvg()
	}

	process(val, ts) {
		this.min.process(val, ts)
		this.max.process(val, ts)
		this.avg.process(val)
	}
}

/**
 * DailyAggregates — hardcodes daily grouping.
 * No grouper parameter. Exposes indexed API: consumers identify days by index (0 = first day, 1 = second day).
 *
 * @class DailyAggregates
 */
export class DailyAggregates {
	#days = new Map() // dateStr → { min: RunningMin, max: RunningMax, avg: RunningAvg }
	#sortedKeys = null // lazy-sorted array of date strings

	/**
	 * Process a value and timestamp, grouping by day.
	 * @param {number} val — the value to aggregate
	 * @param {Temporal.ZonedDateTime} ts — the timestamp
	 */
	process(val, ts) {
		if (typeof val !== "number") return

		const key = DailyAggregates.#toDate(ts)
		if (!this.#days.has(key)) {
			this.#days.set(key, new Aggregates())
			this.#sortedKeys = null
		}

		const bucket = this.#days.get(key)
		bucket.process(val, ts)
	}

	/**
	 * Extract date string YYYY-MM-DD
	 * @param {Temporal.ZonedDateTime} ts
	 */
	static #toDate(ts) {
		return ts.toPlainDate().toString()
	}

	/**
	 * Get the aggregates bucket for the Nth day (chronological, 0-indexed).
	 * @param {number} index — day index
	 * @returns {{ min: RunningMin, max: RunningMax, avg: RunningAvg } | undefined}
	 */
	day(index) {
		if (!this.#sortedKeys) {
			this.#sortedKeys = [...this.#days.keys()].sort()
		}
		const key = this.#sortedKeys[index]
		return key ? this.#days.get(key) : undefined
	}

	/**
	 * Get the aggregates bucket for a specific timestamp's date.
	 * @param {Temporal.Instant} ts — the timestamp
	 * @returns {{ min: RunningMin, max: RunningMax, avg: RunningAvg } | undefined}
	 */
	forTimestamp(ts) {
		const key = DailyAggregates.#toDate(ts)
		return this.#days.get(key)
	}

	/**
	 * Get the number of days with aggregated data.
	 * @returns {number}
	 */
	get dayCount() { return this.#days.size }
}
