import { Column, Series, TimeSeries } from "./time-series.js"

const DK_TIMEZONE = "Europe/Copenhagen"

class ApiUrl {
	static build(host, dt, area = "DK1") {
		const effectiveHost = host ?? new URL("https://www.elprisenligenu.dk")

		const path = `/api/v1/prices/${dt.year}/${this.#month(dt)}-${this.#day(dt)}_${area}.json`
		return new URL(path, effectiveHost)
	}
	static #month(dt) {
		return String(dt.month).padStart(2, "0")
	}
	static #day(dt) {
		return String(dt.day).padStart(2, "0")
	}
}

const initTimeSeries = () => {
	const price = new Column("SpotPrice", "CostPerEnergy", "CCY_DKK-PER-KiloW-HR")
	const timeSeries = new TimeSeries(Series.regular("PT1H"), [price])
	return timeSeries
}

const addRecords = (timeSeries, records) => {
	for (const record of records) {
		const annotatedTime =`${record.time_start}[${DK_TIMEZONE}]`
		const ts = Temporal.ZonedDateTime.from(annotatedTime)
		timeSeries.addRecord(ts, record.DKK_per_kWh)
	}
}

const assertTodaysResponse = (response) => {
	if (!response.ok) {
		throw new Error(`Failed to fetch today's spot prices: ${response.statusText}`)
	}
}

const assertTomorrowsResponse = (response) => {
	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to fetch tomorrow's spot prices: ${response.statusText}`)
	}
}

export async function fetchSpotPrices(host = null) {
	try {

		const dkNow = Temporal.Now.zonedDateTimeISO(DK_TIMEZONE)
		const dkTomorrow = dkNow.add({ days: 1 })

		const todayUrl = ApiUrl.build(host, dkNow)
		const tomorrowUrl = ApiUrl.build(host, dkTomorrow)

		const [todayResponse, tomorrowResponse] = await Promise.all([fetch(todayUrl), fetch(tomorrowUrl)])

		assertTodaysResponse(todayResponse)
		assertTomorrowsResponse(tomorrowResponse)

		const todaysData = await todayResponse.json()

		const timeSeries = initTimeSeries()
		addRecords(timeSeries, todaysData)

		if (tomorrowResponse.ok) {
			const tomorrowsData = await tomorrowResponse.json()
			addRecords(timeSeries, tomorrowsData)
		}

		return timeSeries.build();
	} catch (error) {
		console.error(error);
		throw error;
	}
}
