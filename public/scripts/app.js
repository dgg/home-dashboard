import { fetchSpotPrices } from "./api/spot-prices.js"
import { fetchSolarRadiation } from "./api/solar-radiation.js"
import { fetchSolarProduction } from "./api/solar-production.js"
import { renderMainChart as renderIrradianceChart } from "./charts/irradiance-chart.js"
import { renderPriceChart } from "./charts/price-chart.js"
import { renderProductionChart } from "./charts/production-chart.js"
import { renderSummaryCards } from "./charts/summary-cards.js"

async function init() {
	try {
		console.info("Initializing dashboard...")

		// passing localhost to each of the data fetching functions allowes to "test" the app without a real backend
		const localhost = new URL("http://localhost:8081")

		// Load data in parallel
		const [priceData, radiationData, productionData] = await Promise.all([
			fetchSpotPrices(localhost),
			fetchSolarRadiation(localhost),
			fetchSolarProduction(localhost)
		])

		console.info("All data loaded, rendering...")

		renderSummaryCards("summary-cards-container", priceData, radiationData, productionData)
		renderPriceChart("price-chart-container", priceData)
		renderIrradianceChart("irradiance-chart-container", priceData, radiationData)
		renderProductionChart("production-chart-container", productionData)

	} catch (error) {
		console.error("Dashboard initialization failed:", error);
		// Error handling as per AGENTS.md: surface in UI
		const container = document.getElementById("price-chart-container");
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
