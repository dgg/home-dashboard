import { title } from "./tooltips.mjs"

import { getColorHex, Color } from "../ui/color.mjs"

import { COL_ACC_ENERGY, COL_ENERGY, COL_POWER, COL_TS } from "../api/solar-production.mjs"

const TIME_FORMATTER = new Intl.DateTimeFormat("en", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

const isPrintable = (ts) => ts.hour % 6 === 0

const labels = (timestamps) => (timestamps.map(ts => {
	if (isPrintable(ts)) {
		return TIME_FORMATTER.format(ts.toInstant())
	}
	return ""
}))

const energy = (productionData) => {
	const orange = getColorHex(Color.ORANGE)
	const name = productionData.forecast.header.columns[COL_ENERGY].name
	const unit = productionData.forecast.header.columns[COL_ENERGY].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[COL_ENERGY]),
		backgroundColor: orange,
		borderColor: orange,
		borderWidth: 1,
		borderRadius: 2,
		yAxisID: "yEnergy",
		order: 3
	}
}

const energyAxis = (productionData) => {
	const name = productionData.forecast.header.columns[COL_ENERGY].name
	const unit = productionData.forecast.header.columns[COL_ENERGY].symbol
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
	const name = productionData.forecast.header.columns[COL_POWER].name
	const unit = productionData.forecast.header.columns[COL_POWER].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[COL_POWER]),
		type: "line",
		borderColor: yellow,
		backgroundColor: getColorHex(Color.YELLOW, true),
		fill: true,
		borderDash: [2, 2], // dotted
		pointBackgroundColor: getColorHex(Color.WHITE),
		pointBorderWidth: 2,
		pointRadius: 4,
		tension: 0.4,
		yAxisID: "yPower",
		order: 1
	}
}

const powerAxis = (productionData) => {
	const name = productionData.forecast.header.columns[COL_POWER].name
	const unit = productionData.forecast.header.columns[COL_POWER].symbol
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

const hideAccumulatedGap = (ctx) => ctx.p1.parsed.y < ctx.p0.parsed.y // if descending
? "transparent"
: ctx.p0.options.borderColor

const accumulatedEnergy = (productionData) => {
	const orange = getColorHex(Color.ORANGE)
	const name = productionData.forecast.header.columns[COL_ACC_ENERGY].name
	const unit = productionData.forecast.header.columns[COL_ACC_ENERGY].symbol
	const label = `${name} (${unit})`
	return {
		label,
		data: productionData.forecast.data.map(d => d[COL_ACC_ENERGY]),
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
			borderColor: hideAccumulatedGap
		},
		order: 2
	}
}

export class ProductionChart extends Chart {
	constructor(canvas, productionData) {
		const timestamps = productionData.forecast.data.map(d => d[COL_TS])
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
							title: (context) => title(timestamps, context)
						}
					}
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							maxRotation: 0,
							minRotation: 0
						}
					},
					yPower: powerAxis(productionData),
					yEnergy: energyAxis(productionData)
				}
			}
		})
	}
}
