import { getColorHex, Color } from "../ui/color.mjs"

/**
 * Returns style of axis text
* @param {Object} context
 * @returns {Object} Axis style object
 */
const onTickFont = (context) => {
	const label = context.tick.label
	const isDayOfTheMonth = label &&
		label.length === 5 && // day of the month
		!label.includes(":") // no time separator
	if (isDayOfTheMonth) {
		return { weight: "bold" }
	}
}

const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const DAY_FORMATTER = new Intl.DateTimeFormat("da", {
	day: "2-digit",
	month: "2-digit"
})

const isMidnight = (ts) => ts.hour === 0
const isPrintable = (ts) => ts.hour % 6 === 0

const labels = (timestamps) => (timestamps.map(ts => {
	if (isMidnight(ts)) {
		return DAY_FORMATTER.format(ts.toInstant())
	} else if (isPrintable(ts)) {
		return TIME_FORMATTER.format(ts.toInstant())
	}
	return ""
}))

const priceLegend = () => {
	const patternCanvas = document.createElement("canvas")
	patternCanvas.width = 10
	patternCanvas.height = 10

	const canvasCtx = patternCanvas.getContext("2d")
	canvasCtx.fillStyle = getColorHex(Color.DANGER)
	canvasCtx.fillRect(0, 0, 10, 5)
	canvasCtx.fillStyle = getColorHex(Color.SUCCESS)
	canvasCtx.fillRect(0, 5, 10, 5)
	return patternCanvas
}

const spotPrices = (priceData) => {
	const cheaper = getColorHex(Color.SUCCESS, true)
	const pricier = getColorHex(Color.DANGER, true)

	const data = priceData.forecast.data.map(d => d[1])
	const average = priceData.forecast.header.columns[1].avg
	const colors = priceData.forecast.data.map(d => d[1] > average ? pricier : cheaper)

	const name = priceData.forecast.header.columns[1].name
	const unit = priceData.forecast.header.columns[1].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data,
		backgroundColor: colors,
		borderColor: colors,
		borderWidth: 1,
		borderRadius: 2,
		pointStyle: priceLegend(),
		yAxisID: "yPrice",
		order: 4
	}
}

const averagePrice = (priceData) => {
	const name = priceData.forecast.header.columns[1].name
	const unit = priceData.forecast.header.columns[1].symbol
	const label = `Avg. ${name} (${unit})`

	const records = priceData.forecast.header.records
	const average = priceData.forecast.header.columns[1].avg
	const data = Array(records).fill(average)
	return {
		label,
		data,
		type: "line",
		borderColor: getColorHex(Color.GRAY_400),
		borderWidth: 1.5,
		borderDash: [5, 5],
		pointRadius: 0,
		fill: false,
		yAxisID: "yPrice",
		order: 5
	}
}

const tiltedIrradiance = (irradianceData) => {
	const orange = getColorHex(Color.ORANGE)

	const name = irradianceData.forecast.header.columns[3].name
	const unit = irradianceData.forecast.header.columns[3].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[3]),
		type: "line",
		borderColor: orange,
		pointBackgroundColor: getColorHex(Color.WHITE),
		pointBorderColor: orange,
		pointBorderWidth: 2,
		pointRadius: 4,
		fill: false,
		tension: 0.4,
		yAxisID: "yRadiation",
		order: 1
	}
}

const diffuseRadiation = (irradianceData) => {
	const yellow = getColorHex(Color.YELLOW)

	const name = irradianceData.forecast.header.columns[2].name
	const unit = irradianceData.forecast.header.columns[2].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[2]),
		type: "line",
		borderColor: yellow,
		pointBackgroundColor: yellow,
		pointStyle: "circle",
		borderDash: [2, 2], // dotted
		pointRadius: 0,
		fill: false,
		tension: 0.4,
		yAxisID: "yRadiation",
		order: 2
	}
}
const directRadiation = (irradianceData) => {
	const orange = getColorHex(Color.ORANGE)

	const name = irradianceData.forecast.header.columns[1].name
	const unit = irradianceData.forecast.header.columns[1].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[1]),
		type: "line",
		borderColor: orange,
		pointBackgroundColor: orange,
		pointStyle: "circle",
		borderDash: [5, 5], // dashed
		pointRadius: 0,
		fill: false,
		tension: 0.4,
		yAxisID: "yRadiation",
		order: 3
	}
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const title = (timestamps, context) => {
	const instant = timestamps[context[0].dataIndex].toInstant()
	return DATE_FORMATTER.format(instant)
}

const priceAxis = (priceData) => ({
	type: "linear",
	display: true,
	position: "right",
	title: {
		display: true,
		text: priceData.forecast.header.columns[1].symbol,
		font: { weight: "bold" }
	},
	beginAtZero: true,
	min: 0,
	grid: {
		drawOnChartArea: false, // only want the grid lines for one axis
	}
})


const irradianceAxis = (irradianceData) => ({
	type: "linear",
	display: true,
	position: "left",
	title: {
		display: true,
		text: irradianceData.forecast.header.columns[3].symbol,
		font: { weight: "bold" }
	},
	beginAtZero: true,
	min: 0
})

export class IrradianceChart extends Chart {
	constructor(canvas, irradianceData, priceData) {
		const timestamps = irradianceData.forecast.data.map(d => d[0])
		super(canvas, {
			type: "bar",
			data: {
				labels: labels(timestamps),
				datasets: [
					spotPrices(priceData),
					averagePrice(priceData),
					tiltedIrradiance(irradianceData),
					diffuseRadiation(irradianceData),
					directRadiation(irradianceData)
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: "index",
					intersect: false,
				},
				plugins: {
					legend: {
						display: true,
						position: "top",
						labels: {
							usePointStyle: true,
							boxWidth: 8,
						}
					},
					tooltip: {
						usePointStyle: true,
						boxPadding: 5,
						callbacks: {
							title: (context) => title(timestamps, context),
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							maxRotation: 0,
							minRotation: 0,
							font: onTickFont
						}
					},
					yRadiation: irradianceAxis(irradianceData),
					yPrice: priceAxis(priceData)
				}
			}
		})
	}
}
