/**
 * Fetches solar radiation forecast from a local JSON file and normalizes it to JTS format.
 * @returns {Promise<Object>} JTS formatted solar radiation.
 */
export async function fetchSolarRadiation() {
	try {
		const response = await fetch('../../../data/solar-radiation.forecast.json');
		if (!response.ok) {
			throw new Error(`Failed to fetch solar radiation: ${response.statusText}`);
		}
		const data = await response.json();

		// Normalize to JTS
		const jts = {
			version: "1.0",
			columns: [
				{ name: "time", type: "datetime" },
				{ name: "direct", type: "number" },
				{ name: "diffuse", type: "number" }
			],
			data: data.hourly.time.map((time, index) => [
				time,
				data.hourly.direct_radiation[index],
				data.hourly.diffuse_radiation[index]
			])
		};

		return jts;
	} catch (error) {
		console.error(error);
		throw error;
	}
}
