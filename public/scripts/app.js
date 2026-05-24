import { fetchSpotPrices } from "./api/spot-prices.js"
import { fetchSolarRadiation } from "./api/solar-radiation.js"
import { fetchSolarProduction } from "./api/solar-production.js"
import { renderMainChart } from "./charts/main-chart.js"

async function init() {
	try {
		console.info("Initializing dashboard...")

		// passing localhost to each of the data fetching functions allowes to "test" the app without a real backend
		const localhost = new URL("http://localhost:8081")

		// Load data in parallel
		const [priceData, radiationData, productionData] = await Promise.all([
			fetchSpotPrices(),
			fetchSolarRadiation(),
			//fetchSolarProduction(localhost)
		])

		console.info("All data loaded, rendering...")

		renderMainChart("chart-container", priceData, radiationData)

	} catch (error) {
		console.error("Dashboard initialization failed:", error);
		// Error handling as per AGENTS.md: surface in UI
		const container = document.getElementById("chart-container");
		if (container) {
			container.innerHTML =
			`<div style="color: #d83b01; padding: 2rem; text-align: center;">
				<h3>Error loading dashboard data</h3>
				<p>${error.message}</p>
			</div>
			`;
		}
	}
}

// Start the app when the DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
