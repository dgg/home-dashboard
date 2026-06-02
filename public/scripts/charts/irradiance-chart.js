import { createGradientIcon, createLineIcon } from "./iconHelpers.js"

const formatTime = (dt) => dt.toPlainTime().toString({ smallestUnit: "minute" })

export function renderMainChart(containerId, priceData, radiationData) {
	const container = document.getElementById(containerId)
	if (!container) return

	const chart = echarts.init(container)

	// Calculate max for radiation (right axis) — values are always positive
	const radiationMax = Math.max(
		radiationData.forecast.header.columns[1].max,
		radiationData.forecast.header.columns[2].max,
		radiationData.forecast.header.columns[3].max)

	// Set axis min
	const priceMin = priceData.forecast.header.columns[1].min
	const priceAxisMin = priceMin < 0 ? priceMin : 0

	// Align zeros: calculate ratio of below/above zero for each axis
	const priceBelowZero = Math.abs(priceAxisMin)
	const priceMax = priceData.forecast.header.columns[1].max
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
		name: priceData.forecast.header.columns[1].symbol,
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
		name: radiationData.forecast.header.columns[1].symbol,
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
		name: `${priceData.forecast.header.columns[1].name} (${priceData.forecast.header.columns[1].symbol})`,
		type: "bar",
		data: priceData.forecast.data.map(d => ({
			value: [d[0].epochMilliseconds, d[1]],
			itemStyle: {
				color: d[1] > priceData.forecast.header.columns[1].avg ? "#eeacb2" : "#a6e9ed"
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
					yAxis: priceData.forecast.header.columns[1].avg,
					lineStyle: { type: "dashed", color: "#63276d" },
					label: {
						formatter: `${priceData.forecast.header.columns[1].avg.toFixed(2)}`,
						position: "start",
						color: "#63276d"
					}
				}
			]
		}
	}
	const priceLegend = {
		name: `${priceData.forecast.header.columns[1].name} (${priceData.forecast.header.columns[1].symbol})`,
		icon: createGradientIcon(12, 8, "#eeacb2", "#a6e9ed")
	}

	const directionalRadiationLegend = {
		name: `${radiationData.forecast.header.columns[1].name} (${radiationData.forecast.header.columns[1].symbol})`,
		icon: createLineIcon(12, 8, "#eaa300", "dashed")
	}
	const directRadiationSeries = {
		name: `${radiationData.forecast.header.columns[1].name} (${radiationData.forecast.header.columns[1].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.forecast.data.map(d => [d[0].epochMilliseconds, d[1]]),
		symbol: "none",
		lineStyle: { color: "#eaa300", type: "dashed" }
	}

	const diffuseRadiationLegend = {
		name: `${radiationData.forecast.header.columns[2].name} (${radiationData.forecast.header.columns[2].symbol})`,
		icon: createLineIcon(12, 8, "#eaa300", "dotted")
	}

	const diffuseRadiationSeries = {
		name: `${radiationData.forecast.header.columns[2].name} (${radiationData.forecast.header.columns[2].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.forecast.data.map(d => [d[0].epochMilliseconds, d[2]]),
		symbol: "none",
		lineStyle: { color: "#eaa300", type: "dotted" }
	}

	const tiltedIrradianceLegend = {
		name: `${radiationData.forecast.header.columns[3].name} (${radiationData.forecast.header.columns[3].symbol})`
	}

	const tiltedIrradianceSeries = {
		name: `${radiationData.forecast.header.columns[3].name} (${radiationData.forecast.header.columns[3].symbol})`,
		type: "line",
		smooth: true,
		yAxisIndex: 1,
		emphasis: { focus: "series" },
		data: radiationData.forecast.data.map(d => [d[0].epochMilliseconds, d[3]]),
		itemStyle: { color: "#ff8c00" }
	}

	const weatherSunnyHighIcon = "path://M12 2C12.4142 2 12.75 2.33579 12.75 2.75V3.25C12.75 3.66421 12.4142 4 12 4C11.5858 4 11.25 3.66421 11.25 3.25V2.75C11.25 2.33579 11.5858 2 12 2ZM12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5ZM9.5 9C9.5 7.61929 10.6193 6.5 12 6.5C13.3807 6.5 14.5 7.61929 14.5 9C14.5 10.3807 13.3807 11.5 12 11.5C10.6193 11.5 9.5 10.3807 9.5 9ZM12.75 14.75C12.75 14.3358 12.4142 14 12 14C11.5858 14 11.25 14.3358 11.25 14.75V15.25C11.25 15.6642 11.5858 16 12 16C12.4142 16 12.75 15.6642 12.75 15.25V14.75ZM5.75 8C5.33579 8 5 8.33579 5 8.75C5 9.16421 5.33579 9.5 5.75 9.5H6.25C6.66421 9.5 7 9.16421 7 8.75C7 8.33579 6.66421 8 6.25 8H5.75ZM17 8.75C17 8.33579 17.3358 8 17.75 8H18.25C18.6642 8 19 8.33579 19 8.75C19 9.16421 18.6642 9.5 18.25 9.5H17.75C17.3358 9.5 17 9.16421 17 8.75ZM6.71967 5.78034C7.01256 6.07323 7.48744 6.07323 7.78033 5.78034C8.07322 5.48745 8.07322 5.01257 7.78033 4.71968L7.28033 4.21968C6.98744 3.92679 6.51256 3.92679 6.21967 4.21968C5.92678 4.51257 5.92678 4.98745 6.21967 5.28034L6.71967 5.78034ZM7.78033 12.2197C7.48744 11.9268 7.01256 11.9268 6.71967 12.2197L6.21967 12.7197C5.92678 13.0126 5.92678 13.4874 6.21967 13.7803C6.51256 14.0732 6.98744 14.0732 7.28033 13.7803L7.78033 13.2803C8.07322 12.9874 8.07322 12.5126 7.78033 12.2197ZM17.2803 5.78034C16.9874 6.07323 16.5126 6.07323 16.2197 5.78034C15.9268 5.48745 15.9268 5.01257 16.2197 4.71968L16.7197 4.21968C17.0126 3.92679 17.4874 3.92679 17.7803 4.21968C18.0732 4.51257 18.0732 4.98745 17.7803 5.28034L17.2803 5.78034ZM16.2197 12.2197C16.5126 11.9268 16.9874 11.9268 17.2803 12.2197L17.7803 12.7197C18.0732 13.0126 18.0732 13.4874 17.7803 13.7803C17.4874 14.0732 17.0126 14.0732 16.7197 13.7803L16.2197 13.2803C15.9268 12.9874 15.9268 12.5126 16.2197 12.2197ZM3.21824 21.8359C2.89481 22.0944 2.4231 22.0418 2.16444 21.7185C1.75623 21.2084 2.28256 20.6636 2.28256 20.6636L2.2839 20.6625L2.29919 20.6505C2.30873 20.643 2.32192 20.6328 2.33871 20.62C2.37228 20.5944 2.42023 20.5584 2.48208 20.5136C2.60575 20.4241 2.78516 20.299 3.0164 20.1504C3.47855 19.8533 4.14967 19.4607 4.9983 19.069C6.69334 18.2867 9.11404 17.5 12.0001 17.5C14.8861 17.5 17.3068 18.2867 19.0019 19.069C19.8505 19.4607 20.5216 19.8533 20.9838 20.1504C21.215 20.299 21.3944 20.4241 21.5181 20.5136C21.5799 20.5584 21.6279 20.5944 21.6615 20.62C21.6783 20.6328 21.6915 20.643 21.701 20.6505L21.7126 20.6595L21.7163 20.6625L21.7186 20.6643C22.0421 20.9231 22.0945 21.3951 21.8357 21.7185C21.5771 22.0418 21.105 22.0941 20.7816 21.8357L20.7773 21.8323L20.7518 21.8127C20.7277 21.7943 20.6898 21.7658 20.6383 21.7285C20.5354 21.654 20.3789 21.5447 20.1726 21.4121C19.7598 21.1467 19.1497 20.7893 18.3733 20.431C16.8183 19.7133 14.614 19 12.0001 19C9.38614 19 7.18184 19.7133 5.62688 20.431C4.85051 20.7893 4.24038 21.1467 3.82753 21.4121C3.62127 21.5447 3.46474 21.654 3.36185 21.7285C3.31041 21.7658 3.27243 21.7943 3.24838 21.8127L3.22284 21.8323L3.21824 21.8359Z";
	const weatherSunnyLowIcon = "path://M12.75 2.75C12.75 2.33579 12.4142 2 12 2C11.5858 2 11.25 2.33579 11.25 2.75V4.25C11.25 4.66421 11.5858 5 12 5C12.4142 5 12.75 4.66421 12.75 4.25V2.75ZM19.0303 4.96966C19.3232 5.26255 19.3232 5.73743 19.0303 6.03032L17.9697 7.09098C17.6768 7.38387 17.2019 7.38387 16.909 7.09098C16.6161 6.79809 16.6161 6.32321 16.909 6.03032L17.9697 4.96966C18.2626 4.67677 18.7374 4.67677 19.0303 4.96966ZM17.4093 13C17.4689 12.6757 17.5 12.3415 17.5 12C17.5 8.96243 15.0376 6.5 12 6.5C8.96243 6.5 6.5 8.96243 6.5 12C6.5 12.3415 6.53112 12.6757 6.59069 13H2.75C2.33579 13 2 13.3358 2 13.75C2 14.1642 2.33579 14.5 2.75 14.5H21.25C21.6642 14.5 22 14.1642 22 13.75C22 13.3358 21.6642 13 21.25 13H17.4093ZM12 8C14.2091 8 16 9.79086 16 12C16 12.3453 15.9562 12.6804 15.874 13H8.12602C8.04375 12.6804 8 12.3453 8 12C8 9.79086 9.79086 8 12 8ZM6 16.75C6 16.3358 6.33579 16 6.75 16H17.25C17.6642 16 18 16.3358 18 16.75C18 17.1642 17.6642 17.5 17.25 17.5H6.75C6.33579 17.5 6 17.1642 6 16.75ZM10 19.75C10 19.3358 10.3358 19 10.75 19H13.25C13.6642 19 14 19.3358 14 19.75C14 20.1642 13.6642 20.5 13.25 20.5H10.75C10.3358 20.5 10 20.1642 10 19.75ZM4.96978 4.96967C5.26268 4.67678 5.73755 4.67678 6.03044 4.96967L7.0911 6.03033C7.384 6.32322 7.384 6.7981 7.0911 7.09099C6.79821 7.38388 6.32334 7.38388 6.03044 7.09099L4.96978 6.03033C4.67689 5.73744 4.67689 5.26256 4.96978 4.96967Z";

	const sunriseLegend = {
		name: "Sunrise",
		icon: weatherSunnyHighIcon
	}

	const sunsetLegend = {
		name: "Sunset",
		icon: weatherSunnyLowIcon
	}

	const sunriseSeries = {
		name: "Sunrise",
		type: "scatter",
		yAxisIndex: 1,
		z: 10,
		symbol: weatherSunnyHighIcon,
		symbolSize: 24,
		symbolOffset: [0, -12],
		itemStyle: {
			color: "#c43e00"
		},
		label: {
			show: true,
			position: "top",
			distance: 4,
			color: "#c43e00",
			fontWeight: "bold",
			fontSize: 10,
			backgroundColor: "rgba(255, 255, 255, 0.85)",
			padding: [2, 4],
			borderRadius: 3,
			borderWidth: 1,
			borderColor: "rgba(196, 62, 0, 0.15)",
			formatter: (params) => {
				const sunrise = formatTime(radiationData.transit.data[params.dataIndex][1])
				return sunrise
			}
		},
		data: radiationData.transit.data.map(d => [d[1].epochMilliseconds, 10]),
		tooltip: {
			valueFormatter: (value, dataIndex) => {
				const sunrise = formatTime(radiationData.transit.data[dataIndex][1])
				return sunrise
			}
		}
	}

	const sunsetSeries = {
		name: "Sunset",
		type: "scatter",
		yAxisIndex: 1,
		z: 10,
		symbol: weatherSunnyLowIcon,
		symbolSize: 24,
		symbolOffset: [0, -12],
		itemStyle: {
			color: "#5c2d91"
		},
		label: {
			show: true,
			position: "top",
			distance: 4,
			color: "#5c2d91",
			fontWeight: "bold",
			fontSize: 10,
			backgroundColor: "rgba(255, 255, 255, 0.85)",
			padding: [2, 4],
			borderRadius: 3,
			borderWidth: 1,
			borderColor: "rgba(92, 45, 145, 0.15)",
			formatter: (params) => {
				const sunset = radiationData.transit.data[params.dataIndex][2]
				return formatTime(sunset)
			}
		},
		data: radiationData.transit.data.map(d => [d[2].epochMilliseconds, 10]),
		tooltip: {
			valueFormatter: (value, dataIndex) => {
				const sunset = radiationData.transit.data[dataIndex][2]
				return formatTime(sunset)
			}
		}
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
				tiltedIrradianceLegend,
				sunriseLegend,
				sunsetLegend
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
			tiltedIrradianceSeries,
			sunriseSeries,
			sunsetSeries
		]
	}

	chart.setOption(option)

	window.addEventListener("resize", () => {
		chart.resize()
	})
}
