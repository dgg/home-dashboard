import { getColorHex, Color } from "../ui/color.mjs"

const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const DAY_FORMATTER = new Intl.DateTimeFormat("da", {
	day: "2-digit",
	month: "2-digit"
})

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const isMidnight = (ts) => ts.hour === 0
const isPrintable = (ts) => ts.hour % 6 === 0

const labels = (timestamps) => timestamps.map(ts => {

	if (isMidnight(ts)) {
		return DAY_FORMATTER.format(ts.toInstant())
	} else if (isPrintable(ts)) {
		return TIME_FORMATTER.format(ts.toInstant())
	}
	return ""
})

const onTickFont = (context) => {
	const label = context.tick.label
	const isDayOfTheMonth = label &&
		label.length === 5 &&
		!label.includes(":")
	if (isDayOfTheMonth) {
		return { weight: "bold" }
	}
}

const title = (timestamps, context) => {
	const instant = timestamps[context[0].dataIndex].toInstant()
	return DATE_FORMATTER.format(instant)
}

const spotPrices = (priceData) => {
	const backgroundColor = getColorHex(Color.BLUE)
	const borderColor = getColorHex(Color.BLUE)

	const name = priceData.forecast.header.columns[1].name
	const unit = priceData.forecast.header.columns[1].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: priceData.forecast.data.map(d => d[1]),
		backgroundColor,
		borderColor,
		borderWidth: 1,
		borderRadius: 0,
		stack: "price-today",
		order: 1
	}
}

const actualPrices = (priceData) => {
	const backgroundColor = getColorHex(Color.BLUE, true)
	const borderColor = getColorHex(Color.BLUE)

	const name = priceData.forecast.header.columns[2].name
	const unit = priceData.forecast.header.columns[2].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: priceData.forecast.data.map(d => d[2]),
		backgroundColor,
		borderColor,
		borderWidth: 1,
		borderRadius: 10,
		stack: "price-today",
		order: 2
	}
}

const dailyAverage = (a) => a?.length == 24 ?
	a.reduce((sum, n) => sum + n, 0) / 24 :
	null

const averageActualPrices = (priceData) => {
	const name = priceData.forecast.header.columns[2].name
	const unit = priceData.forecast.header.columns[2].symbol
	const label = `Avg. ${name} (${unit})`

	const records = priceData.forecast.header.records

	const actualSum = (sum, n) => sum + n[2]

	const todaysSum = priceData.forecast.data.slice(0, 24).reduce(actualSum, 0)
	let data = Array(24).fill(todaysSum /24)

	if (records == 48) {
		const tomorrowsSum = priceData.forecast.data.slice(24).reduce(actualSum, 0)
		data = [...data, ...Array(24).fill(tomorrowsSum / 24)]
	}

	const borderColor = getColorHex(Color.GRAY_400)

	return {
		label,
		data,
		type: "line",
		borderColor,
		borderWidth: 1.5,
		borderDash: [5, 5],
		pointRadius: 0,
		fill: false,
		segment: {
			// transparent if horizontal
			borderColor: (ctx) => ctx.p0.parsed.y !== ctx.p1.parsed.y ? "transparent" : ctx.p0.options.borderColor
		},
		stepped: true,
		order: 3
	}
}

/*const todayAverageLine = (priceData) => {
	const avg = priceData.forecast.header.columns[1].avg
	if (avg === undefined) {
		return null
	}

	const name = priceData.forecast.header.columns[1].name
	const unit = priceData.forecast.header.columns[1].symbol
	const label = `Avg. ${name} (${unit})`

	const data = Array(48).fill(null)
	for (let i = 0; i < 24; i++) {
		data[i] = avg
	}

	return {
		label,
		data,
		type: "line",
		borderColor: "#adadad",
		borderWidth: 1.5,
		borderDash: [5, 5],
		pointRadius: 0,
		fill: false,
		stack: undefined,
		order: 5
	}
}

const tomorrowAverageLine = (priceData) => {
	const avg = priceData.forecast.header.columns[3].avg
	if (avg === undefined) {
		return null
	}

	const name = priceData.forecast.header.columns[3].name
	const unit = priceData.forecast.header.columns[3].symbol
	const label = `Avg. ${name} (${unit})`

	const data = Array(48).fill(null)
	for (let i = 24; i < 48; i++) {
		data[i] = avg
	}

	return {
		label,
		data,
		type: "line",
		borderColor: "#888888",
		borderWidth: 1.5,
		borderDash: [5, 5],
		pointRadius: 0,
		fill: false,
		stack: undefined,
		order: 6
	}
}*/

const priceAxis = (priceData) => ({
	type: "linear",
	display: true,
	position: "left",
	stacked: false,
	title: {
		display: true,
		text: priceData.forecast.header.columns[1].symbol,
		font: { weight: "bold" }
	},
	beginAtZero: true,
	min: 0
})

export class PriceChart extends Chart {
	constructor(canvas, priceData) {
		const timestamps = priceData.forecast.data.map(d => d[0])

		/*const todayAvg = todayAverageLine(priceData)
		if (todayAvg) {
			datasets.push(todayAvg)
		}

		const tomorrowAvg = tomorrowAverageLine(priceData)
		if (tomorrowAvg) {
			datasets.push(tomorrowAvg)
		}*/

		super(canvas, {
			type: "bar",
			data: {
				labels: labels(timestamps),
				datasets: [
					spotPrices(priceData),
					actualPrices(priceData),
					averageActualPrices(priceData)
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: "index",
					intersect: false
				},
				plugins: {
					legend: {
						display: true,
						position: "top",
						labels: {
							usePointStyle: true,
							boxWidth: 8
						}
					},
					tooltip: {
						usePointStyle: true,
						boxPadding: 5,
						callbacks: {
							title: (context) => title(timestamps, context)
						}
					}
				},
				scales: {
					x: {
						stacked: false,
						grid: { display: false },
						ticks: {
							maxRotation: 0,
							minRotation: 0,
							font: onTickFont
						}
					},
					y: priceAxis(priceData)
				}
			}
		})
	}
}
