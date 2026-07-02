import { getColorVariant, Color } from "../ui/color.mjs"

const sunriseLine = getColorVariant(Color.ORANGE)
const light = getColorVariant(Color.YELLOW)
const midday = getColorVariant(Color.YELLOW, "lt")
const sunsetLine = getColorVariant(Color.PURPLE)

const sunriseToSunsetLineGradient = (context) => {
	const { ctx, chartArea } = context.chart
	if (!chartArea) return null

	const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
	gradient.addColorStop(0, sunriseLine)
	gradient.addColorStop(0.1, light)
	gradient.addColorStop(0.5, midday)
	gradient.addColorStop(0.9, light)
	gradient.addColorStop(1, sunsetLine)
	return gradient;
}

const sunriseBg = getColorVariant(Color.ORANGE, "200")
const sunsetBg = getColorVariant(Color.PURPLE, "200")

const sunriseToSunsetBackgroundGradient = (context) => {
	const { ctx, chartArea } = context.chart
	if (!chartArea) return null

	const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
	gradient.addColorStop(0, sunriseBg)
	gradient.addColorStop(0.3, midday)
	gradient.addColorStop(0.5, midday)
	gradient.addColorStop(0.6, midday)
	gradient.addColorStop(1, sunsetBg)
	return gradient;
}

const sunTrack = () => {
	const data = []
	for (let i = 0; i <= 100; i += 1) {
		data.push({ x: i, y: Math.sin((i * Math.PI) / 100) })
	}
	return {
		data,
		showLine: true,
		borderWidth: 4,
		pointRadius: 0,
		fill: true,
		borderColor: sunriseToSunsetLineGradient,
		backgroundColor: sunriseToSunsetBackgroundGradient,
	}
}

const horizonLine = () => {
	return {
		data: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
		showLine: true,
		//borderColor: "rgba(30, 41, 59, 0.08)",
		borderWidth: 10,
		pointRadius: 0
	}
}

export class SummaryChart extends Chart {
	constructor(canvas, irradianceData) {
		super(canvas, {
			type: "scatter",
			data: {
				datasets: [
					sunTrack(),
					//horizonLine()
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: "index",
					intersect: false
				},
				plugins: {
					legend: { display: false },
					tooltip: { enabled: false }
				},
				scales: {
					x: { type: 'linear', min: 0, max: 100, display: false },
					y: { min: 0, max: 1.15, display: false }
				}
			}
		})
	}
}
