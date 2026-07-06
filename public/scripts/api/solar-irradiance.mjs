import { Column, Series, TimeSeries } from "./series/time-series.mjs"

export { COL_TS } from "./series/time-series.mjs"

export const COL_DIRECT = 1
export const COL_DIFFUSE = 2
export const COL_TILTED = 3

export const COL_SUNRISE = 1
export const COL_SUNSET = 2

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

const initForecast = () => {
	const direct = new Column("Direct Radiation", "PowerPerArea", "W-PER-M2", "W/m²")
	const diffuse = new Column("Diffuse Radiation", "PowerPerArea", "W-PER-M2", "W/m²")
	const tilted = new Column("Tilted Irradiance", "PowerPerArea", "W-PER-M2", "W/m²")
	const timeSeries = new TimeSeries(Series.regular("PT1H"), [direct, diffuse, tilted])
	return timeSeries
}

const initTransit = () => {
	const sunset = new Column("Sunset", "Time", "UNITLESS", "一")
	const sunrise = new Column("Sunrise", "Time", "UNITLESS", "一")
	const timeSeries = new TimeSeries(Series.irregular(), [sunrise, sunset])
	return timeSeries
}

/**
 * Fetches solar radiation forecast from a local JSON file and normalizes it to JTS format.
 * @returns {Promise<Object>} JTS formatted solar radiation.
 */
export async function fetchSolarIrradiance(host = null) {
	try {
		const requestUrl = ApiUrl.build(host)

		console.debug("Fetching solar irradiance from:", requestUrl)

		const response = await fetch(requestUrl)
		assertResponse(response)
		const data = await response.json()

		const forecast = data.hourly.time
			.reduce((acc, time, index) => {
				const annotatedTime = `${time}[${DK_TIMEZONE}]`
				return acc.addRecord(Temporal.ZonedDateTime.from(annotatedTime),
					data.hourly.direct_radiation[index],
					data.hourly.diffuse_radiation[index],
					data.hourly.global_tilted_irradiance[index])
			}, initForecast())

		const transit = data.daily.time.reduce((acc, ts, index) => {
			const annotatedTimestamp = `${ts}[${DK_TIMEZONE}]`
			const annotatedSunset = `${data.daily.sunset[index]}[${DK_TIMEZONE}]`
			const annotatedSunrise = `${data.daily.sunrise[index]}[${DK_TIMEZONE}]`
			return acc.addRecord(
				Temporal.ZonedDateTime.from(annotatedTimestamp),
				Temporal.ZonedDateTime.from(annotatedSunrise),
				Temporal.ZonedDateTime.from(annotatedSunset))
		}, initTransit())

		return {
			forecast: forecast.build(),
			transit: transit.build(),
			fetchedAt: Temporal.Now.zonedDateTimeISO(DK_TIMEZONE)
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
