import { getColorHex, Color } from "../ui/color.mjs"

const onTickFont = (context) => {
	const label = context.tick.label
	const isDayOfTheMonth = label &&
		label.length === 5 && // day of the month
		!label.includes(":") // no time separator
	if (isDayOfTheMonth) {
		return { weight: "bold" }
	}
}

const maxEnergyLabel = (productionData) => ({
	id: "maxEnergyLabel",
	afterDatasetsDraw(chart) {
		const { ctx: chartCtx, data: chartData } = chart
		chartCtx.save()
		chartCtx.font = "bold 13px Inter"
		chartCtx.textAlign = "center"
		chartCtx.textBaseline = "bottom"
		chartCtx.fillStyle = getColorHex(Color.ORANGE)

		const maxEnergy = productionData.forecast.header.columns[2].max
		const meta = chart.getDatasetMeta(0)
		meta.data.forEach((bar, index) => {
			const value = chartData.datasets[0].data[index]
			if (value === maxEnergy && value > 0) {
				chartCtx.fillText(value.toFixed(2), bar.x, bar.y - 5)
			}
		})
		chartCtx.restore()
	}
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const DAY_FORMATTER = new Intl.DateTimeFormat("da", {
	day: "2-digit",
	month: "2-digit"
})

const isMidnight = (ts) => ts.hour < 6
const isPrintable = (ts) => ts.hour % 6 === 0

const labels = (timestamps) => (timestamps.map(ts => {
	if (isMidnight(ts)) {
		return DAY_FORMATTER.format(ts.toInstant())
	} else if (isPrintable(ts)) {
		return TIME_FORMATTER.format(ts.toInstant())
	}
	return ""
}))

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

const label = (context) => {
	let label = context.dataset.label || ""
	if (label) {
		label += ": "
	}
	if (context.parsed.y !== null) {
		label += context.parsed.y.toFixed(2)
	}
	return label
}


const energy = (productionData) => {
	const orange = getColorHex(Color.ORANGE)
	const name = productionData.forecast.header.columns[2].name
	const unit = productionData.forecast.header.columns[2].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[2]),
		backgroundColor: orange,
		borderColor: orange,
		borderWidth: 1,
		borderRadius: 2,
		yAxisID: "yEnergy",
		order: 3
	}
}

const energyAxis = (productionData) => {
	const name = productionData.forecast.header.columns[2].name
	const unit = productionData.forecast.header.columns[2].symbol
	const text = `${name} (${unit})`
	return {
		type: "linear",
		display: true,
		position: "right",
		title: {
			display: true,
			text,
			font: { weight: "bold" }
		},
		beginAtZero: true,
		grid: {
			drawOnChartArea: false,
		}
	}
}

const power = (productionData) => {
	const yellow = getColorHex(Color.YELLOW)
	const name = productionData.forecast.header.columns[1].name
	const unit = productionData.forecast.header.columns[1].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[1]),
		type: "line",
		borderColor: yellow,
		backgroundColor: getColorHex(Color.YELLOW, true),
		fill: true,
		pointBackgroundColor: getColorHex(Color.WHITE),
		pointBorderColor: yellow,
		pointBorderWidth: 2,
		pointRadius: 4,
		tension: 0.4,
		yAxisID: "yPower",
		order: 1
	}
}

const powerAxis = (productionData) => {
	const name = productionData.forecast.header.columns[1].name
	const unit = productionData.forecast.header.columns[1].symbol
	const text = `${name} (${unit})`

	return {
		type: "linear",
		display: true,
		position: "left",
		title: {
			display: true,
			text,
			font: { weight: "bold" }
		},
		beginAtZero: true
	}
}

const accumulatedEnergy = (productionData) => {
	const orange = getColorHex(Color.ORANGE)
	const name = productionData.forecast.header.columns[3].name
	const unit = productionData.forecast.header.columns[3].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[3]),
		type: "line",
		borderColor: orange,
		pointBackgroundColor: getColorHex(Color.WHITE),
		pointBorderColor: orange,
		pointBorderWidth: 2,
		pointRadius: 4,
		tension: 0.4,
		fill: false,
		yAxisID: "yEnergy",
		segment: {
			// transparent if descending value
			borderColor: (ctx) => ctx.p1.parsed.y < ctx.p0.parsed.y ? "transparent" : ctx.p0.options.borderColor
		},
		order: 2
	}
}

export class ProductionChart extends Chart {
	constructor(canvas, productionData) {
		const timestamps = productionData.forecast.data.map(d => d[0])
		super(canvas, {
			type: "bar",
			data: {
				labels: labels(timestamps),
				datasets: [
					energy(productionData),
					power(productionData),
					accumulatedEnergy(productionData)
				]
			},
			plugins: [maxEnergyLabel(productionData)],
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
							label: (context) => label(context)
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							maxRotation: 0,
							minRotation: 0,
							onTickFont
						}
					},
					yPower: powerAxis(productionData),
					yEnergy: energyAxis(productionData)
				}
			}
		})
	}
}
