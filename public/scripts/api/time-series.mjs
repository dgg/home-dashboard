import { RunningAvg } from "./running-avg.mjs"
import { RunningMin } from "./running-min.mjs"
import { RunningMax } from "./running-max.mjs"

/**
 * Represents the series type and period
 */
export class Series {
	/**
	 * Create a Series instance
	 * @param {string} kind - The kind of series ("regular" or "irregular")
	 * @param {string} [period] - The period for regular series (optional)ß
	 */
	constructor(kind, period = undefined) {
		this.kind = kind
		this.period = period
	}

	/**
	 * Create a regular series
	 * @param {string|Duration} period - The period for the regular series in ISO 8601 format (e.g., "PT1H")
	 * @returns {Series} A regular Series instance
	 */
	static regular(period) {
		let effectivePeriod = period
		if (typeof period === "string") {
			effectivePeriod = Temporal.Duration.from(period)
		} else if (!(period instanceof Temporal.Duration)) {
			throw new Error("Period must be a string in ISO 8601 format or a Temporal.Duration instance")
		}
		return new Series("regular", effectivePeriod)
	}

	/**
	 * Create an irregular series
	 * @returns {Series} An irregular Series instance
	 */
	static irregular() {
		return new Series("irregular")
	}
}

/**
 * Represents a column in the time series
 */
export class Column {
	/**
	 * Create a Column instance
	 * @param {string} name - The name of the column
	 * @param {string} quantifiable - The quantifiable type as a QUDT quantity kind
	 * @param {string} unit - The unit of measurement as a QUDT unit
	 * @param {string} symbol - The unit of measurement symbol (optional)
	 */
	constructor(name, quantifiable, unit, symbol = "") {
		this.name = name
		this.quantifiable = quantifiable
		this.unit = unit
		this.symbol = symbol

		this.min = new RunningMin()
		this.max = new RunningMax()
		this.avg = new RunningAvg()
	}

	/**
	 * Create a time column
	 * @returns {Column} A time Column instance
	 */
	static time() {
		return new Column("ts", "Time", "UNITLESS")
	}

	/**
	 * Recalculates the aggregates with each new value added
	 * @param {number} val - The value to add
	 */
	recalculateAggregates(val, ts) {
		this.min.process(val, ts)
		this.max.process(val, ts)
		this.avg.process(val)
	}
}

/**
 * Represents the header of a time series
 */
class Header {
	/**
	 * Create a Header instance
	 * @param {Series} series - The series type and period
	 * @param {Date} start - The start date
	 * @param {Date} end - The end date
	 * @param {number} records - The number of records
	 * @param {Array<Column>} columns - The array of columns
	 */
	constructor(series, start, end, records, columns) {
		this.series = series
		this.start = start
		this.end = end
		this.records = records
		this.columns = columns
	}
}

/**
 * Represents a time series with header metadata and data rows
 */
export class TimeSeries {
	/**
	 * Create a TimeSeries instance
	 * @param {Series} series - The series configuration
	 * @param {Array<Column>} columns - The array of columns
	 */
	constructor(series, columns) {
		this.series = series
		// add time if not there
		this.columns = columns[0].name !== "ts" ? [Column.time(), ...columns] : columns

		this.rows = []
	}

	/**
	 * Add a record to the time series
	 * @param {ZonedDateTime} timestamp - The timestamp for the record as a local date time
	 * @param {...*} values - Variable number of column values matching the initial columns
	 * @returns {TimeSeries} The time series instance for fluent chaining
	 * @throws {Error} If timestamp is invalid or number of values doesn"t match columns
	 */
	addRecord(ts, ...values) {
		this.#assertColumns(values)

		this.rows.push([ts, ...values])

		values.forEach((val, i) => {
			this.columns[i + 1].recalculateAggregates(val, ts)
		})

		return this
	}

	/**
	 * Asserts that the number of values matches the number of columns
	 * @private
	 * @param {Array} values - The array of values to assert
	 * @throws {Error} If the number of values doesn"t match the number of columns
	 */
	#assertColumns(values) {
		const recordLength = this.columns.length - 1 // +1 for timestamp
		if (values.length !== recordLength) {
			throw new Error(`Expected ${recordLength} values, but got ${values.length}.`)
		}
	}

	/**
	 * Build the final time series object with header and data
	 * @returns {Object} An object with header and data properties
	 * @throws {Error} If there are no records to build from
	 */
	build() {
		this.#assertRecords()

		// sort by ts ascending
		this.rows.sort((a, b) => a[0].epochMilliseconds - b[0].epochMilliseconds)

		const start = this.#calculateStart()
		const end = this.#calculateEnd()

		this.columns[0].min = start
		this.columns[0].max = end

		const header = new Header(
			this.series,
			start,
			end,
			this.rows.length,
			this.columns
		)

		const built = { header, data: this.rows }
		return built
	}

	/**
	 * Assert that there are records to build from
	 * @private
	 * @throws {Error} If there are no records
	 */
	#assertRecords() {
		if (this.rows.length === 0) {
			throw new Error("Cannot build a TimeSeries with no records")
		}
	}

	/**
	 * Calculate the end date from the last record
	 * @private
	 * @returns {Date} The end date
	 */
	#calculateEnd() {
		return this.rows[this.rows.length - 1][0]
	}

	/**
	 * Calculate the start date from the first record
	 * @private
	 * @returns {Date} The start date
	 */
	#calculateStart() {
		return this.rows[0][0]
	}
}
