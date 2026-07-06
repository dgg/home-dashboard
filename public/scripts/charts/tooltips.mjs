const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

export const title = (timestamps, context) => {
	const instant = timestamps[context[0].dataIndex].toInstant()
	return DATE_FORMATTER.format(instant)
}
