export function renderMainChart(containerId, priceData, radiationData) {
	const container = document.getElementById(containerId);
	if (!container) return;

	const chart = echarts.init(container);

	const priceUnit = "DKK/kWh"
	const irradianceUnit = "W/m²"
	const powerUnit = "W"
	const energyUnit = "Wh"

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			}
		},
		legend: {
			data: [
				priceData.header.columns[1].name,
				radiationData.header.columns[1].name,
				radiationData.header.columns[2].name,
				radiationData.header.columns[3].name
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
				stack: "Total",
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
				stack: "Total",
				//areaStyle: {},
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
				stack: "Total",
				//areaStyle: {},
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
