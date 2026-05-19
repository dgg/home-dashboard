/**
 * Fetches spot prices from a local JSON file and normalizes them to JTS format.
 * @returns {Promise<Object>} JTS formatted spot prices.
 */
export async function fetchSpotPrices() {
	try {
		const response = await fetch('../../../data/spot-prices.json');
		if (!response.ok) {
			throw new Error(`Failed to fetch spot prices: ${response.statusText}`);
		}
		const data = await response.json();

		// Normalize to JTS
		const jts = {
			version: "1.0",
			columns: [
				{ name: "time", type: "datetime" },
				{ name: "price", type: "number" }
			],
			data: data.records.map(record => [
				record.TimeDK,
				record.DayAheadPriceDKK
			])
		};

		return jts;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
