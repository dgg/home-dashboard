import { Column, Series, TimeSeries } from "./time-series.js"

const DK_TIMEZONE = "Europe/Copenhagen"

class ApiUrl {
	static build(host, args = {}) {
		const effectiveHost = host ?? new URL("https://api.forecast.solar")

		const lat = args.latitude ?? 55.7309
		const lon = args.longitude ?? 9.6208
		const dec = args.decline ?? 15
		const az = args.azimuth ?? -18
		const kwp = args.capacity ?? 10

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

const initForecast = () => {
	const powerProduction = new Column("PowerProduction", "Power", "KiloW", "kW")
	const energyProduction = new Column("EnergyProduction", "Energy", "KiloW-HR", "kWh")
	const accumulatedEnergyProduction = new Column("AccumulatedEnergyProduction", "Energy", "KiloW-HR", "kWh")
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

		const forecast = Object.entries(data.result.watts)
			.reduce((acc, [key, value], index) => {
				const annotatedTime = `${key}[${DK_TIMEZONE}]`
				const ts = Temporal.ZonedDateTime.from(annotatedTime)

				const power = value / 1000
				const energy = data.result.watt_hours_period[key] / 1000
				const accumulatedEnergy = data.result.watt_hours[key] / 1000
				return acc.addRecord(ts, power, energy, accumulatedEnergy)
			}, initForecast())

		return { forecast: forecast.build() }
	} catch (error) {
		console.error(error)
		throw error
	}
}
