import { Column, Series, TimeSeries } from "./time-series.js"

const DK_TIMEZONE = "Europe/Copenhagen"

class ApiUrl {
	static build(host, args = {}) {
		const effectiveHost = host ?? new URL("https://api.forecast.solar")

		const lat = args.latitude ?? 55.7309  // From example data
		const lon = args.longitude ?? 9.6208  // From example data
		const dec = args.decline ?? 15        // Default decline/tilt
		const az = args.azimuth ?? -18        // Default azimuth
		const kwp = args.capacity ?? 10       // Default capacity in kWp

		var requestUrl = new URL(`/estimate/${lat}/${lon}/${dec}/${az}/${kwp}`, effectiveHost)
		requestUrl.searchParams.append("time", "iso8601")
		requestUrl.searchParams.append("limit", 2)
		requestUrl.searchParams.append("resolution", 60)

		return requestUrl
	}
}

const assertResponse = (response) => {
	if (!response.ok) {
		throw new Error(`Failed to fetch solar production: ${response.statusText}`)
	}
}

const initTimeSeries = () => {
	const powerProduction = new Column("PowerProduction", "Power", "W")
	const energyProduction = new Column("EnergyProduction", "Energy", "Wh")
	const accumulatedEnergyProduction = new Column("AccumulatedEnergyProduction", "Energy", "Wh")
	const timeSeries = new TimeSeries(Series.regular("PT1H"), [powerProduction, energyProduction, accumulatedEnergyProduction])
	return timeSeries
}

/**
 * Fetches solar production forecast from Solar Forecast API and normalizes it to JTS format.
 * @returns {Promise<Object>} JTS formatted solar production.
 */
export async function fetchSolarProduction(host = null) {
	try {
		const requestUrl = ApiUrl.build(host)
		const response = await fetch(requestUrl)

		assertResponse(response)
		const data = await response.json()

		const timeSeries = Object.entries(data.result.watts)
			.reduce((acc, [key, value], index) => {
				const annotatedTime = `${key}[${DK_TIMEZONE}]`
				const ts = Temporal.ZonedDateTime.from(annotatedTime)

				const power = value
				const energy = data.result.watt_hours_period[key]
				const accumulatedEnergy = data.result.watt_hours[key]
				return acc.addRecord(ts, power, energy, accumulatedEnergy)
			}, initTimeSeries())

		return timeSeries.build()
	} catch (error) {
		console.error(error)
		throw error
	}
}
