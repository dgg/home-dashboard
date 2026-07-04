import { fetchSpotPrices } from "./api/spot-prices.mjs"
import { fetchSolarIrradiance } from "./api/solar-irradiance.mjs"
import { fetchSolarProduction } from "./api/solar-production.mjs"

import { handleNavSelection } from "./ui/navigation.mjs"
import { ProductionChart } from "./charts/production-chart.mjs"
import { IrradianceChart } from "./charts/irradiance-chart.mjs"
import { PriceChart } from "./charts/price-chart.mjs"

import "./ui/solar-transit-card.mjs"
import "./ui/solar-irradiance-card.mjs"
import "./ui/electricity-price-card.mjs"
import "./ui/solar-production-card.mjs"

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

		const productionCanvas = document.getElementById("chart-production")
		const productionChart = new ProductionChart(productionCanvas, productionData)
		const productionToday = document.getElementById("solar-production-today")
		productionToday.data = productionData
		const productionTomorrow = document.getElementById("solar-production-tomorrow")
		productionTomorrow.data = productionData
		console.log(productionData)
		console.log(priceData)
		console.log(irradianceData)

		const irradianceCanvas = document.getElementById("chart-irradiance")
		const irradianceChart = new IrradianceChart(irradianceCanvas, irradianceData, priceData)
		const transitToday = document.getElementById("solar-transit-today")
		transitToday.data = irradianceData
		const transitTomorrow = document.getElementById("solar-transit-tomorrow")
		transitTomorrow.data = irradianceData

		const irradianceToday = document.getElementById("solar-irradiance-today")
		irradianceToday.data = irradianceData
		const irradianceTomorrow = document.getElementById("solar-irradiance-tomorrow")
		irradianceTomorrow.data = irradianceData

		const pricesCanvas = document.getElementById("chart-price")
		const priceChart = new PriceChart(pricesCanvas, priceData)
		const priceToday = document.getElementById("electricity-price-today")
		priceToday.data = priceData
		const priceTomorrow = document.getElementById("electricity-price-tomorrow")
		priceTomorrow.data = priceData

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
