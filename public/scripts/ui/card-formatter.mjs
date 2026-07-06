const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

/**
 *
 * @param {Temporal.ZonedDateTime} t
 * @returns HH:mm
 */
export const formatTime = (t) => t ? TIME_FORMATTER.format(t.toInstant()) : "-"
/**
 *
 * @param {number} value
 * @param {*} unitSymbol
 * @param {number} fractionDigits
 * @returns val unit
 */
export const formatValue = (value, unitSymbol, fractionDigits = 2) => isFinite(value)
	? `${value.toFixed(fractionDigits)} ${unitSymbol}`
	: "-"

const DURATION_FORMATTER = new Intl.DurationFormat("en", {
	style: "narrow"
})

/**
 *
 * @param {Temporal.Duration} d
 * @returns Hh mm
 */
export const formatDuration = (d) => DURATION_FORMATTER.format(d)
