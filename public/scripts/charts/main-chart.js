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

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			}
		},
		legend: {
			data: [
				`${priceData.header.columns[1].name} (${priceData.header.columns[1].symbol})`,
				`${radiationData.header.columns[1].name} (${radiationData.header.columns[1].symbol})`,
				`${radiationData.header.columns[2].name} (${radiationData.header.columns[2].symbol})`,
				`${radiationData.header.columns[3].name} (${radiationData.header.columns[3].symbol})`
			],
			bottom: 0
		},
		grid: {
			left: "3%",
			right: "4%",
			bottom: "10%",
			containLabel: true
		},
		xAxis: [
			{
				type: "time",
				boundaryGap: false
			}
		],
		yAxis: [
			{
				type: "value",
				name: priceData.header.columns[1].symbol,
				position: "left",
				min: priceAxisMinAdjusted,
				max: priceMax,
				axisLine: {
					show: true,
					lineStyle: { color: "#0078d4" }
				},
				axisLabel: {
					formatter: "{value}"
				}
			},
			{
				type: "value",
				name: radiationData.header.columns[1].symbol,
				position: "right",
				min: radiationAxisMinAdjusted,
				max: radiationMax,
				axisLine: {
					show: true,
					lineStyle: { color: "#ff8c00" }
				},
				axisLabel: {
					formatter: "{value}"
				}
			}
		],
		series: [
			{
				name: `${priceData.header.columns[1].name} (${priceData.header.columns[1].symbol})`,
				type: "bar",
				data: priceData.data.map(d => [d[0].epochMilliseconds, d[1]]),
				itemStyle: {
					color: "#0078d4",
					opacity: 0.6
				}
			},
		{
			name: `${radiationData.header.columns[1].name} (${radiationData.header.columns[1].symbol})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[1]]),
			symbol: "none",
			lineStyle: { color: "#f9e2ae", type: "dashed" }
		},
		{
			name: `${radiationData.header.columns[2].name} (${radiationData.header.columns[2].symbol})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[2]]),
			symbol: "none",
			lineStyle: { color: "#ffddb3", type: "dotted" }
		},
		{
			name: `${radiationData.header.columns[3].name} (${radiationData.header.columns[3].symbol})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[3]]),
			itemStyle: { color: "#ff8c00" }
		}
		]
	}

	chart.setOption(option)

	window.addEventListener("resize", () => {
		chart.resize()
	})
}
