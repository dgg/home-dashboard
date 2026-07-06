const DAY_FORMATTER = new Intl.DateTimeFormat("da", {
	day: "2-digit",
	month: "2-digit"
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const isMidnight = (ts) => ts.hour === 0
const isPrintable = (ts) => ts.hour % 6 === 0

export const labels = (timestamps) => timestamps.map(ts => {

	if (isMidnight(ts)) {
		return DAY_FORMATTER.format(ts.toInstant())
	} else if (isPrintable(ts)) {
		return TIME_FORMATTER.format(ts.toInstant())
	}
	return ""
})

/**
 * Returns style of axis text
* @param {Object} context
 * @returns {Object} Axis style object
 */
export const thickenDayLabel = (context) => {
	const label = context.tick.label
	const isDayOfTheMonth = label &&
		label.length === 5 && // day of the month
		!label.includes(":") // no time separator
	if (isDayOfTheMonth) {
		return { weight: "bold" }
	}
}
