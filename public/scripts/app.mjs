import { fetchSpotPrices } from "./api/spot-prices.mjs"
import { fetchSolarRadiation } from "./api/solar-radiation.mjs"
import { fetchSolarProduction } from "./api/solar-production.mjs"

import { handleNavSelection } from "./ui/navigation.mjs"
import { ProductionChart } from "./charts/production-chart.mjs"

import data from "../../data/solar-production.forecast.json" with {type: "json"}

const init = async () => {
	try {
		console.info("Initializing...")

		// Set up UI navigation
		handleNavSelection(".nav-minimal .nav-link")

		// passing localhost to each of the data fetching functions allowes to "test" the app without a real backend
		const localhost = new URL("http://localhost:8081")

		// Load data in parallel
		const [priceData, radiationData, productionData] = await Promise.all([
			fetchSpotPrices(localhost),
			fetchSolarRadiation(localhost),
			fetchSolarProduction(localhost)
		])

		console.info("Data loaded successfully")
		const productionCanvas = document.getElementById("chart-production")
		const productionChart = new ProductionChart(productionCanvas, productionData)//renderProductionChart(productionCanvas, data, productionData)

		console.info("Initialized")

	} catch (error) {
		console.error("Initialization failed:", error)
	}
}

// Start the app when the DOM is ready
if (document.readyState === "loading") {
	console.debug("DOM loading...")
	document.addEventListener("DOMContentLoaded", init)
} else {
	console.debug("DOM already ready")
	init()
}
