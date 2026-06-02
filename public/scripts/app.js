import { fetchSpotPrices } from "./api/spot-prices.js"
import { fetchSolarRadiation } from "./api/solar-radiation.js"
import { fetchSolarProduction } from "./api/solar-production.js"
import { renderMainChart as renderIrradianceChart } from "./charts/irradiance-chart.js"
import { renderPriceChart } from "./charts/price-chart.js"
import { renderProductionChart } from "./charts/production-chart.js"
import { renderSummaryCards } from "./charts/summary-cards.js"

// Configuration for scheduling
const SCHEDULED_HOURS = [5, 13, 21] // 3 times a day
const SCHEDULED_MINUTE = 5 // At 05 past the hour to ensure prices are published
const RETRY_DELAY_MS = 5 * 60 * 1000 // 5 minutes retry delay

/**
 * Renders the dashboard with the provided data.
 */
function render(priceData, radiationData, productionData) {
	renderSummaryCards("summary-cards-container", priceData, radiationData, productionData)
	renderPriceChart("price-chart-container", priceData)
	renderIrradianceChart("irradiance-chart-container", priceData, radiationData)
	renderProductionChart("production-chart-container", productionData)
}

/**
 * Displays an error message in the UI.
 */
function surfaceError(error) {
	const container = document.getElementById("price-chart-container")
	if (container) {
		container.innerHTML = `
			<div style="color: #d83b01 padding: 2rem text-align: center">
				<h3>Error loading dashboard data</h3>
				<p>${error.message}</p>
			</div>
		`
	}
}

/**
 * Fetches data and updates the dashboard.
 * @param {boolean} isRetry Whether this is a retry attempt.
 */
async function refresh(isRetry = false) {
	try {
		console.info(isRetry ? "Retrying data fetch..." : "Refreshing dashboard data...")

		// passing localhost to each of the data fetching functions allowes to "test" the app without a real backend
		const localhost = new URL("http://localhost:8081")

		// Load data in parallel
		const [priceData, radiationData, productionData] = await Promise.all([
			fetchSpotPrices(),
			fetchSolarRadiation(),
			fetchSolarProduction()
		])

		console.info("Data loaded successfully")
		render(priceData, radiationData, productionData)
		console.info("Dashboards updated.")

	} catch (error) {
		console.error("Refresh failed:", error)
		surfaceError(error)

		if (!isRetry) {
			console.info(`Scheduling retry in ${RETRY_DELAY_MS / 1000 / 60} minutes...`)
			setTimeout(() => refresh(true), RETRY_DELAY_MS)
		}
	}
}

/**
 * Schedules the next data refresh based on the defined schedule.
 */
function scheduleNextUpdate() {
	const now = new Date()
	let nextUpdate = null

	// Find the next scheduled time today
	for (const hour of SCHEDULED_HOURS) {
		const candidate = new Date(now)
		candidate.setHours(hour, SCHEDULED_MINUTE, 0, 0)
		if (candidate > now) {
			nextUpdate = candidate
			break
		}
	}

	// If no more scheduled times today, schedule for the first time tomorrow
	if (!nextUpdate) {
		nextUpdate = new Date(now)
		nextUpdate.setDate(now.getDate() + 1)
		nextUpdate.setHours(SCHEDULED_HOURS[0], SCHEDULED_MINUTE, 0, 0)
	}

	const delay = nextUpdate.getTime() - now.getTime()
	console.info(`Next update scheduled for ${nextUpdate.toLocaleString()} (in ${Math.round(delay / 1000 / 60)} minutes)`)

	setTimeout(async () => {
		await refresh()
		scheduleNextUpdate()
	}, delay)
}

async function init() {
	try {
		console.info("Initializing dashboard...")
		await refresh()
		scheduleNextUpdate()
	} catch (error) {
		console.error("Dashboard initialization failed:", error)
		surfaceError(error)
	}
}

// Start the app when the DOM is ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init)
} else {
	init()
}
