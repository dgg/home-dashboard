import { fetchSpotPrices } from './api/spot-prices.js';
import { fetchSolarRadiation } from './api/solar-radiation.js';
import { renderMainChart } from './charts/main-chart.js';

/**
 * Initializes the dashboard application.
 */
async function init() {
	try {
		// Load data in parallel
		const [priceData, radiationData] = await Promise.all([
			fetchSpotPrices(),
			fetchSolarRadiation()
		]);

		console.log('Price Data (JTS):', priceData);
		console.log('Radiation Data (JTS):', radiationData);

		// Render chart
		renderMainChart('chart-container', priceData, radiationData);

	} catch (error) {
		console.error('Dashboard initialization failed:', error);
		// Error handling as per AGENTS.md: surface in UI
		const container = document.getElementById('chart-container');
		if (container) {
			container.innerHTML = `
                <div style="color: #d83b01; padding: 2rem; text-align: center;">
                    <h3>Error loading dashboard data</h3>
                    <p>${error.message}</p>
                </div>
            `;
		}
	}
}

// Start the app when the DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
