import { Column, Series, TimeSeries } from "./time-series.js"

const DK_TIMEZONE = "Europe/Copenhagen"

class ApiUrl {
	static build(host, args = {}) {
		const effectiveHost = host ?? new URL("https://api.open-meteo.com")

		var requestUrl = new URL("/v1/forecast", effectiveHost)
		requestUrl.searchParams.append("latitude", args.latitude ?? 55.6761)
		requestUrl.searchParams.append("longitude", args.longitude ?? 12.5683)
		requestUrl.searchParams.append("hourly", "direct_radiation,diffuse_radiation,global_tilted_irradiance")
		requestUrl.searchParams.append("daily", "sunrise,sunset")
		requestUrl.searchParams.append("timezone", "CET")
		requestUrl.searchParams.append("forecast_days", 2)
		requestUrl.searchParams.append("tilt", args.tilt ?? 15)
		requestUrl.searchParams.append("azimuth", args.azimuth ?? -18)

		return requestUrl
	}
}

const assertResponse = (response) => {
	if (!response.ok) {
		throw new Error(`Failed to fetch solar radiation: ${response.statusText}`)
	}
}

const initTimeSeries = () => {
	const direct = new Column("DirectRadiation", "PowerPerArea", "W-PER-M2")
	const diffuse = new Column("DiffuseRadiation", "PowerPerArea", "W-PER-M2")
	const tilted = new Column("TiltedIrradiance", "PowerPerArea", "W-PER-M2")
	const timeSeries = new TimeSeries(Series.regular("PT1H"), [direct, diffuse, tilted])
	return timeSeries
}

/**
 * Fetches solar radiation forecast from a local JSON file and normalizes it to JTS format.
 * @returns {Promise<Object>} JTS formatted solar radiation.
 */
export async function fetchSolarRadiation(host = null) {
	try {
		const requestUrl = ApiUrl.build(host)
		const response = await fetch(requestUrl)
		assertResponse(response)
		const data = await response.json()

		const timeSeries = data.hourly.time
			.reduce((acc, time, index) => {
				const annotatedTime = `${time}[${DK_TIMEZONE}]`
				return acc.addRecord(Temporal.ZonedDateTime.from(annotatedTime),
					data.hourly.direct_radiation[index],
					data.hourly.diffuse_radiation[index],
					data.hourly.global_tilted_irradiance[index])
			}, initTimeSeries())

		return timeSeries.build();
	} catch (error) {
		console.error(error);
		throw error;
	}
}
