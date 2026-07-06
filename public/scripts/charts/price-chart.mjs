import { labels, thickenDayLabel } from "./labels.mjs"
import { title } from "./tooltips.mjs"

import { getColorHex, Color } from "../ui/color.mjs"

import { COL_ACTUAL, COL_SPOT, COL_TS } from "../api/spot-prices.mjs"

const spotPrices = (priceData) => {
	const backgroundColor = getColorHex(Color.BLUE)
	const borderColor = getColorHex(Color.BLUE)

	const name = priceData.forecast.header.columns[COL_SPOT].name
	const unit = priceData.forecast.header.columns[COL_SPOT].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: priceData.forecast.data.map(d => d[COL_SPOT]),
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

	const name = priceData.forecast.header.columns[COL_ACTUAL].name
	const unit = priceData.forecast.header.columns[COL_ACTUAL].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: priceData.forecast.data.map(d => d[COL_ACTUAL]),
		backgroundColor,
		borderColor,
		borderWidth: 1,
		borderRadius: 10,
		stack: "price-today",
		order: 2
	}
}

const hideStep = (ctx) => ctx.p0.parsed.y !== ctx.p1.parsed.y
	? "transparent"
	: ctx.p0.options.borderColor

const averageActualPrices = (priceData, timestamps) => {
	const col = priceData.forecast.header.columns[COL_ACTUAL]
	const unit = col.symbol
	const label = `Avg. ${col.name} (${unit})`

	const aggregates = col.aggregates
	const data = timestamps.map(ts => {
		const entry = aggregates.forTimestamp(ts)
		return entry ? entry.avg.avg : null
	})

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
			borderColor: hideStep
		},
		stepped: true,
		order: 3
	}
}

const priceAxis = (priceData) => ({
	type: "linear",
	display: true,
	position: "left",
	stacked: false,
	title: {
		display: true,
		text: priceData.forecast.header.columns[COL_SPOT].symbol,
		font: { weight: "bold" }
	},
	beginAtZero: true,
	min: 0
})

export class PriceChart extends Chart {
	constructor(canvas, priceData) {
		const timestamps = priceData.forecast.data.map(d => d[COL_TS])

		super(canvas, {
			type: "bar",
			data: {
				labels: labels(timestamps),
				datasets: [
					spotPrices(priceData),
					actualPrices(priceData),
					averageActualPrices(priceData, timestamps)
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
							font: thickenDayLabel
						}
					},
					y: priceAxis(priceData)
				}
			}
		})
	}
}
