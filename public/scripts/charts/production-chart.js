import { createAreaIcon, createLineIcon, createBarIcon } from "./iconHelpers.js"

export function renderProductionChart(containerId, productionData) {
	const container = document.getElementById(containerId)
	if (!container) return

	const chart = echarts.init(container)

	const powerAxis = {
		type: "value",
		name: productionData.header.columns[1].symbol,
		nameLocation: "middle",
		nameRotate: 90,
		nameGap: 36,
		nameTextStyle: { fontSize: 10, fontWeight: "bold" },
		position: "left",
		splitLine: { show: false },
		axisLine: { show: true },
		axisLabel: { formatter: "{value}" }
	}

	const energyAxis = {
		type: "value",
		name: productionData.header.columns[2].symbol,
		nameLocation: "middle",
		nameRotate: 90,
		nameGap: 36,
		nameTextStyle: { fontSize: 10 },
		position: "right",
		splitLine: {
			lineStyle: { type: "dashed", opacity: 0.2 }
		},
		axisLine: { show: true },
		axisLabel: { formatter: "{value}" }
	}

	const powerLegend = {
		name: `${productionData.header.columns[1].name} (${productionData.header.columns[1].symbol})`,
		icon: createAreaIcon(12, 8, "#ffc107", 0.3)
	}

	const powerSeries = {
		name: `${productionData.header.columns[1].name} (${productionData.header.columns[1].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 0,
		emphasis: { focus: "series" },
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[1]]),
		symbol: "circle", // Round markers
		symbolSize: 4, // Size of the markers
		showSymbol: true, // Ensure symbols are shown
		lineStyle: { color: "#ffc107", width: 3 },
		itemStyle: { color: "#ffffff", borderColor: "#ffc107", borderWidth: 2 }, // Hollow markers with yellow border
		areaStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{ offset: 0, color: "rgba(255, 193, 7, 0.4)" },
				{ offset: 1, color: "rgba(255, 193, 7, 0.02)" }
			])
		}
	}


	const energyLegend = {
		name: `${productionData.header.columns[2].name} (${productionData.header.columns[2].symbol})`,
		icon: createBarIcon(12, 8, "#FF8C00") // Updated to orange color
	}

	const energySeries = {
		name: `${productionData.header.columns[2].name} (${productionData.header.columns[2].symbol})`,
		type: "bar",
		yAxisIndex: 1,
		itemStyle: {
			color: '#FF8C00', // Orange color
			opacity: 0.8,
			borderRadius: [6, 6, 0, 0] // Increased rounding
		},
		barWidth: 20, // Fixed width in pixels for consistent thickness
		barGap: '30%', // Increased gap between bars
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[2]]),
	}

	const accumulatedLegend = {
		name: `${productionData.header.columns[3].name} (${productionData.header.columns[3].symbol})`,
	}

	const accumulatedSeries = {
		name: `${productionData.header.columns[3].name} (${productionData.header.columns[3].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[3]]),
		symbol: "circle", // Round markers
		symbolSize: 4, // Size of the markers
		showSymbol: true, // Ensure symbols are shown
		lineStyle: { color: "#FF8C00", width: 2 }, // Changed to orange color
		itemStyle: { color: "#ffffff", borderColor: "#FF8C00", borderWidth: 2 } // Hollow markers with orange border
	}

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			}
		},
		legend: {
			data: [
				powerLegend,
				energyLegend,
				accumulatedLegend
			],
			left: "center",
			top: 0,
			itemWidth: 12,
			itemHeight: 8,
			textStyle: { fontSize: 10 }
		},
		grid: {
			left: "3%",
			right: "4%",
			top: 22,
			bottom: 8,
			containLabel: true
		},
		xAxis: [
			{
				type: "time",
				boundaryGap: ['2%', '2%'], // Add padding at both ends
			}
		],
		yAxis: [
			powerAxis,
			energyAxis
		],
		series: [
			powerSeries,
			energySeries,
			accumulatedSeries
		]
	}

	chart.setOption(option)

	window.addEventListener("resize", () => {
		chart.resize()
	})
}
