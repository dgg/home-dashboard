import { labels, thickenDayLabel } from "./labels.mjs"
import { title } from "./tooltips.mjs"

import { getColorHex, Color } from "../ui/color.mjs"

import { COL_DIFFUSE, COL_DIRECT, COL_TILTED, COL_TS } from "../api/solar-irradiance.mjs"
import { COL_SPOT } from "../api/spot-prices.mjs"

const spotPrices = (priceData) => {
	const data = priceData.forecast.data.map(d => d[COL_SPOT])

	const name = priceData.forecast.header.columns[COL_SPOT].name
	const unit = priceData.forecast.header.columns[COL_SPOT].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data,
		backgroundColor: getColorHex(Color.SUCCESS, true),
		borderColor: getColorHex(Color.SUCCESS),
		borderWidth: 1,
		borderRadius: 2,
		yAxisID: "yPrice",
		order: 4
	}
}

const tiltedIrradiance = (irradianceData) => {
	const orange = getColorHex(Color.ORANGE)

	const name = irradianceData.forecast.header.columns[COL_TILTED].name
	const unit = irradianceData.forecast.header.columns[COL_TILTED].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[COL_TILTED]),
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

	const name = irradianceData.forecast.header.columns[COL_DIFFUSE].name
	const unit = irradianceData.forecast.header.columns[COL_DIFFUSE].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[COL_DIFFUSE]),
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

	const name = irradianceData.forecast.header.columns[COL_DIRECT].name
	const unit = irradianceData.forecast.header.columns[COL_DIRECT].symbol
	const label = `${name} (${unit})`

	return {
		label,
		data: irradianceData.forecast.data.map(d => d[COL_DIRECT]),
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

const priceAxis = (priceData) => ({
	type: "linear",
	display: true,
	position: "right",
	title: {
		display: true,
		text: priceData.forecast.header.columns[COL_DIRECT].symbol,
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
		text: irradianceData.forecast.header.columns[COL_TILTED].symbol,
		font: { weight: "bold" }
	},
	beginAtZero: true,
	min: 0
})

export class IrradianceChart extends Chart {
	constructor(canvas, irradianceData, priceData) {
		const timestamps = irradianceData.forecast.data.map(d => d[COL_TS])
		super(canvas, {
			type: "bar",
			data: {
				labels: labels(timestamps),
				datasets: [
					spotPrices(priceData),
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
							font: thickenDayLabel
						}
					},
					yRadiation: irradianceAxis(irradianceData),
					yPrice: priceAxis(priceData)
				}
			}
		})
	}
}
