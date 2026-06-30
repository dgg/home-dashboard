import { Column, Series, TimeSeries } from "./time-series.mjs"

const DK_TIMEZONE = "Europe/Copenhagen"
const API_HOST = "https://billigkwh.dk"
const API_PATH = "/api/Priser/HentPriser"

class ApiUrl {
	static build(host = null) {
		const effectiveHost = host ?? API_HOST
		const url = new URL(API_PATH, effectiveHost)
		url.searchParams.set("sted", "DK1")
		url.searchParams.set("netselskab", "konstant_c")
		url.searchParams.set("produkt", "groen_ok_el_spot")
		return url
	}
}

const initForecast = () => {
	const priserColumn = new Column("Spot Price", "CostPerEnergy", "CCY_DKK-PER-KiloW-HR", "DKK/kWh")
	const exTaxColumn = new Column("Actual Price", "CostPerEnergy", "CCY_DKK-PER-KiloW-HR", "DKK/kWh")
	const timeSeries = new TimeSeries(Series.regular("PT1H"), [priserColumn, exTaxColumn])
	return timeSeries
}

const addRecords = (timeSeries, dayData) => {
	// UTC designator breaks parsing -> remove
	const dateStr = dayData.dato.replace('Z', '')
	const baseDate = Temporal.ZonedDateTime.from(`${dateStr}[${DK_TIMEZONE}]`)

	for (let hour = 0; hour < dayData.priser.length; hour++) {
		const timestamp = baseDate.add({ hours: hour })
		const actualPrice = dayData.priser[hour]
		const spotPrice = dayData.spotExMoms[hour]
		timeSeries.addRecord(timestamp, spotPrice, actualPrice)
	}
}

const assertResponse = (response) => {
	if (!response.ok) {
		throw new Error(`Failed to fetch spot prices: ${response.statusText}`)
	}
}

export async function fetchSpotPrices(host = null) {
	try {
		const url = ApiUrl.build(host)
		console.debug("Fetching spot prices from:", url)

		const response = await fetch(url)
		assertResponse(response)

		const data = await response.json()
		const forecast = initForecast()

		// Add records for each day that has price data
		for (const dayData of data) {
			if (dayData.priser.length > 0) {
				addRecords(forecast, dayData)
			}
		}

		return {
			forecast: forecast.build(),
			fetchedAt: Temporal.Now.zonedDateTimeISO(DK_TIMEZONE)
		}
	} catch (error) {
		console.error(error)
		throw error
	}
}
