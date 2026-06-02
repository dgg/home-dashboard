import { createGradientIcon, createLineIcon } from "./iconHelpers.js"

export function renderPriceChart(containerId, priceData) {
	const container = document.getElementById(containerId)
	if (!container) return

	const chart = echarts.init(container)

	const option = {
		tooltip: {
			trigger: "axis",
			axisPointer: {
				type: "cross"
			}
		},
		legend: {
			data: [
				{
					name: `${priceData.forecast.header.columns[1].name} (${priceData.forecast.header.columns[1].symbol})`,
					icon: createGradientIcon(12, 8, "#dc626d", "#54b054")
				}
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
			{
				type: "value",
				name: priceData.forecast.header.columns[1].symbol,
				nameLocation: "middle",
				nameRotate: 90,
				nameGap: 36,
				nameTextStyle: { fontSize: 10, fontWeight: "bold" },
				position: "left",
				axisLine: { show: true, },
				axisLabel: {
					formatter: "{value}"
				}
			}
		],
		series: [
			{
				name: `${priceData.forecast.header.columns[1].name} (${priceData.forecast.header.columns[1].symbol})`,
				type: "bar",
				data: priceData.forecast.data.map(d => ({
					value: [d[0].epochMilliseconds, d[1]],
					itemStyle: {
						color: d[1] > priceData.forecast.header.columns[1].avg ? "#dc626d" : "#54b054"
					}
				})),
				itemStyle: {
					opacity: 0.6
				},
				markLine: {
					silent: true,
					symbol: "none",
					data: [
						{
							yAxis: priceData.forecast.header.columns[1].avg,
							lineStyle: { type: "dashed", color: "#adadad" },
							label: {
								formatter: `${priceData.forecast.header.columns[1].avg.toFixed(2)}`,
								position: "start",
								color: "#adadad"
							}
						}
					]
				}
			}
		]
	}

	chart.setOption(option)

	window.addEventListener("resize", () => {
		chart.resize()
	})
}
