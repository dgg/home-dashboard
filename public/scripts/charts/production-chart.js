import { createLineIcon } from "./iconHelpers.js"

export function renderProductionChart(containerId, productionData) {
	const container = document.getElementById(containerId)
	if (!container) return

	const chart = echarts.init(container)

	const powerMax = productionData.header.columns[1].max
	const energyMax = Math.max(
		productionData.header.columns[2].max,
		productionData.header.columns[3].max)

	const powerAxis = {
		type: "value",
		name: productionData.header.columns[1].symbol,
		nameLocation: "middle",
		nameRotate: 90,
		nameGap: 36,
		nameTextStyle: { fontSize: 10, fontWeight: "bold" },
		position: "left",
		min: 0,
		max: powerMax,
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
		min: 0,
		max: energyMax,
		axisLine: { show: true },
		axisLabel: { formatter: "{value}" }
	}

	const powerLegend = {
		name: `${productionData.header.columns[1].name} (${productionData.header.columns[1].symbol})`,
		icon: createLineIcon(12, 8, "#4caf50", "solid")
	}

	const powerSeries = {
		name: `${productionData.header.columns[1].name} (${productionData.header.columns[1].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 0,
		emphasis: { focus: "series" },
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[1]]),
		symbol: "none",
		lineStyle: { color: "#4caf50", width: 2 }
	}

	const energyLegend = {
		name: `${productionData.header.columns[2].name} (${productionData.header.columns[2].symbol})`,
		icon: createLineIcon(12, 8, "#ff9800", "dashed")
	}

	const energySeries = {
		name: `${productionData.header.columns[2].name} (${productionData.header.columns[2].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[2]]),
		symbol: "none",
		lineStyle: { color: "#ff9800", type: "dashed", width: 2 }
	}

	const accumulatedLegend = {
		name: `${productionData.header.columns[3].name} (${productionData.header.columns[3].symbol})`,
		icon: createLineIcon(12, 8, "#7c4dff", "dotted")
	}

	const accumulatedSeries = {
		name: `${productionData.header.columns[3].name} (${productionData.header.columns[3].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: productionData.data.map(d => [d[0].epochMilliseconds, d[3]]),
		symbol: "none",
		lineStyle: { color: "#7c4dff", type: "dotted", width: 2 }
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
				boundaryGap: false
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