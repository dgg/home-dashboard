/**
 * Renders the main dashboard chart using ECharts.
 * @param {string} containerId - The ID of the DOM element to render the chart into.
 * @param {Object} priceData - JTS formatted price data.
 * @param {Object} radiationData - JTS formatted radiation data.
 */
export function renderMainChart(containerId, priceData, radiationData) {
	const container = document.getElementById(containerId);
	if (!container) return;

	const chart = echarts.init(container);

	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			}
		},
		legend: {
			data: ['Spot Price', 'Direct Radiation', 'Diffuse Radiation'],
			bottom: 0
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '10%',
			containLabel: true
		},
		xAxis: [
			{
				type: 'time',
				boundaryGap: false
			}
		],
		yAxis: [
			{
				type: 'value',
				name: 'Price (DKK/MWh)',
				position: 'left',
				axisLine: {
					show: true,
					lineStyle: { color: '#0078d4' }
				},
				axisLabel: {
					formatter: '{value}'
				}
			},
			{
				type: 'value',
				name: 'Radiation (W/m²)',
				position: 'right',
				axisLine: {
					show: true,
					lineStyle: { color: '#ff8c00' }
				},
				axisLabel: {
					formatter: '{value}'
				}
			}
		],
		series: [
			{
				name: 'Spot Price',
				type: 'bar',
				data: priceData.data,
				itemStyle: {
					color: '#0078d4',
					opacity: 0.6
				}
			},
			{
				name: 'Direct Radiation',
				type: 'line',
				yAxisIndex: 1,
				stack: 'Total',
				areaStyle: {},
				emphasis: { focus: 'series' },
				data: radiationData.data.map(d => [d[0], d[1]]),
				itemStyle: { color: '#ff8c00' }
			},
			{
				name: 'Diffuse Radiation',
				type: 'line',
				yAxisIndex: 1,
				stack: 'Total',
				areaStyle: {},
				emphasis: { focus: 'series' },
				data: radiationData.data.map(d => [d[0], d[2]]),
				itemStyle: { color: '#ffd700' }
			}
		]
	};

	chart.setOption(option);

	window.addEventListener('resize', () => {
		chart.resize();
	});
}
