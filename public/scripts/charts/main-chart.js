export function renderMainChart(containerId, priceData, radiationData) {
	const container = document.getElementById(containerId);
	if (!container) return;

	const chart = echarts.init(container);

	const priceUnit = "DKK/kWh"
	const irradianceUnit = "W/m²"
	const powerUnit = "W"
	const energyUnit = "Wh"

	// Calculate min/max for price (left axis)
	const priceValues = priceData.data.map(d => d[1]);
	const priceMin = Math.min(...priceValues);
	const priceMax = Math.max(...priceValues);

	// Calculate min/max for radiation (right axis)
	const radiationValues = radiationData.data.flatMap(d => [d[1], d[2], d[3]]);
	const radiationMin = Math.min(...radiationValues);
	const radiationMax = Math.max(...radiationValues);

	// Align zeros: find absolute max magnitude on each axis
	const priceAbsMax = Math.max(Math.abs(priceMin), Math.abs(priceMax));
	const radiationAbsMax = Math.max(Math.abs(radiationMin), Math.abs(radiationMax));

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			}
		},
		legend: {
			data: [
				`${priceData.header.columns[1].name} (${priceUnit})`,
				`${radiationData.header.columns[1].name} (${irradianceUnit})`,
				`${radiationData.header.columns[2].name} (${irradianceUnit})`,
				`${radiationData.header.columns[3].name} (${irradianceUnit})`
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
				name: priceUnit,
				position: "left",
				min: -priceAbsMax,
				max: priceAbsMax,
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
				name: irradianceUnit,
				position: "right",
				min: -radiationAbsMax,
				max: radiationAbsMax,
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
				name: `${priceData.header.columns[1].name} (${priceUnit})`,
				type: "bar",
				data: priceData.data.map(d => [d[0].epochMilliseconds, d[1]]),
				itemStyle: {
					color: "#0078d4",
					opacity: 0.6
				}
			},
		{
			name: `${radiationData.header.columns[1].name} (${irradianceUnit})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[1]]),
			symbol: "none",
			lineStyle: { color: "#f9e2ae", type: "dashed" }
		},
		{
			name: `${radiationData.header.columns[2].name} (${irradianceUnit})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[2]]),
			symbol: "none",
			lineStyle: { color: "#ffddb3", type: "dotted" }
		},
		{
			name: `${radiationData.header.columns[3].name} (${irradianceUnit})`,
			type: "line",
			smooth: true,
			yAxisIndex: 1,
			emphasis: { focus: "series" },
			data: radiationData.data.map(d => [d[0].epochMilliseconds, d[3]]),
			itemStyle: { color: "#ff8c00" }
		}
		]
	};

	chart.setOption(option);

	window.addEventListener("resize", () => {
		chart.resize();
	});
}
