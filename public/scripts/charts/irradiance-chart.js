import { createGradientIcon, createLineIcon } from "./iconHelpers.js"

export function renderMainChart(containerId, priceData, radiationData) {
	const container = document.getElementById(containerId)
	if (!container) return

	const chart = echarts.init(container)

	// Calculate max for radiation (right axis) — values are always positive
	const radiationMax = Math.max(
		radiationData.header.columns[1].max,
		radiationData.header.columns[2].max,
		radiationData.header.columns[3].max)

	// Set axis min
	const priceMin = priceData.header.columns[1].min
	const priceAxisMin = priceMin < 0 ? priceMin : 0

	// Align zeros: calculate ratio of below/above zero for each axis
	const priceBelowZero = Math.abs(priceAxisMin)
	const priceMax = priceData.header.columns[1].max
	const priceAboveZero = priceMax

	// For each axis, ensure min/max symmetric around zero at same ratio
	const priceRatio = priceBelowZero > 0 ? priceAboveZero / priceBelowZero : 1

	// Use max ratio for both — this aligns zeros
	const maxRatio = Math.max(priceRatio, 1)

	// Recalculate mins to align zeros using max ratio
	const priceAxisMinAdjusted = -(priceAboveZero / maxRatio)
	const radiationAxisMinAdjusted = -(radiationMax / maxRatio)

	const priceAxis = {
		type: "value",
		name: priceData.header.columns[1].symbol,
		nameLocation: "middle",
		nameRotate: 90,
		nameGap: 36,
		nameTextStyle: { fontSize: 10, fontWeight: "bold" },
		position: "left",
		min: priceAxisMinAdjusted,
		max: priceMax,
		axisLine: { show: true },
		axisLabel: { formatter: "{value}" }
	}

	const radiationAxis = {
		type: "value",
		name: radiationData.header.columns[1].symbol,
		nameLocation: "middle",
		nameRotate: 90,
		nameGap: 36,
		nameTextStyle: { fontSize: 10 },
		position: "right",
		min: radiationAxisMinAdjusted,
		max: radiationMax,
		axisLine: { show: true },
		axisLabel: { formatter: "{value}" }
	}

	const priceSeries = {
		name: `${priceData.header.columns[1].name} (${priceData.header.columns[1].symbol})`,
		type: "bar",
		data: priceData.data.map(d => ({
			value: [d[0].epochMilliseconds, d[1]],
			itemStyle: {
				color: d[1] > priceData.header.columns[1].avg ? "#eeacb2" : "#a6e9ed"
			}
		})),
		itemStyle: {
			opacity: 0.6,
			color: "#eeacb2"
		},
		markLine: {
			silent: true,
			symbol: "none",
			data: [
				{
					yAxis: priceData.header.columns[1].avg,
					lineStyle: { type: "dashed", color: "#63276d" },
					label: {
						formatter: `${priceData.header.columns[1].avg.toFixed(2)}`,
						position: "start",
						color: "#63276d"
					}
				}
			]
		}
	}
	const priceLegend = {
		name: `${priceData.header.columns[1].name} (${priceData.header.columns[1].symbol})`,
		icon: createGradientIcon(12, 8, "#eeacb2", "#a6e9ed")
	}

	const directionalRadiationLegend = {
		name: `${radiationData.header.columns[1].name} (${radiationData.header.columns[1].symbol})`,
		icon: createLineIcon(12, 8, "#f9e2ae", "dashed")
	}
	const directRadiationSeries = {
		name: `${radiationData.header.columns[1].name} (${radiationData.header.columns[1].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.data.map(d => [d[0].epochMilliseconds, d[1]]),
		symbol: "none",
		lineStyle: { color: "#f9e2ae", type: "dashed" }
	}

	const diffuseRadiationLegend = {
		name: `${radiationData.header.columns[2].name} (${radiationData.header.columns[2].symbol})`,
		icon: createLineIcon(12, 8, "#ffddb3", "dotted")
	}

	const diffuseRadiationSeries = {
		name: `${radiationData.header.columns[2].name} (${radiationData.header.columns[2].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.data.map(d => [d[0].epochMilliseconds, d[2]]),
		symbol: "none",
		lineStyle: { color: "#ffddb3", type: "dotted" }
	}

	const tiltedIrradianceLegend = {
		name: `${radiationData.header.columns[3].name} (${radiationData.header.columns[3].symbol})`
	}

	const tiltedIrradianceSeries = {
		name: `${radiationData.header.columns[3].name} (${radiationData.header.columns[3].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.data.map(d => [d[0].epochMilliseconds, d[3]]),
		itemStyle: { color: "#ff8c00" }
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
				priceLegend,
				directionalRadiationLegend,
				diffuseRadiationLegend,
				tiltedIrradianceLegend
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
			priceAxis,
			radiationAxis
		],
		series: [
			priceSeries,
			directRadiationSeries,
			diffuseRadiationSeries,
			tiltedIrradianceSeries
		]
	}

	chart.setOption(option)

	window.addEventListener("resize", () => {
		chart.resize()
	})
}
