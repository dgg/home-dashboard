import { fetchSpotPrices } from "./api/spot-prices.mjs"
import { fetchSolarIrradiance } from "./api/solar-irradiance.mjs"
import { fetchSolarProduction } from "./api/solar-production.mjs"

import { handleNavSelection } from "./ui/navigation.mjs"
import { ProductionChart } from "./charts/production-chart.mjs"
import { IrradianceChart } from "./charts/irradiance-chart.mjs"
import { PriceChart } from "./charts/price-chart.mjs"
import "./ui/solar-transit-card.mjs"

const init = async () => {
	try {
		console.info("Initializing...")

		// Set up UI navigation
		handleNavSelection(".nav-minimal .nav-link")

		// passing localhost to each of the data fetching functions allowes to "test" the app without a real backend
		const localhost = new URL("http://localhost:8081")

		// Load data in parallel
		const [priceData, irradianceData, productionData] = await Promise.all([
			fetchSpotPrices(localhost),
			fetchSolarIrradiance(localhost),
			fetchSolarProduction(localhost)
		])

		console.info("Data loaded successfully")

		const transitToday = document.getElementById("solar-transit-today")
		transitToday.data = irradianceData
		const transitTomorrow = document.getElementById("solar-transit-tomorrow")
		transitTomorrow.data = irradianceData

		const productionCanvas = document.getElementById("chart-production")
		const productionChart = new ProductionChart(productionCanvas, productionData)

		const irradianceCanvas = document.getElementById("chart-irradiance")
		const irradianceChart = new IrradianceChart(irradianceCanvas, irradianceData, priceData)

		const pricesCanvas = document.getElementById("chart-price")
		const priceChart = new PriceChart(pricesCanvas, priceData)

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
