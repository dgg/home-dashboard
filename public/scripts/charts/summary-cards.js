/**
 * Helper to render summary cards
 */

const ICONS = {
	PRICE_MIN: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#107c10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>`,
	PRICE_AVG: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>`,
	PRICE_MAX: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#d13438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m17.41 14.59-2.82 2.82.7.71"/></svg>`,
	SUNRISE: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#ff8c00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8M5.22 5.22l1.42 1.42M18.78 5.22l-1.42 1.42M2 12h2M20 12h2M12 18a6 6 0 1 1 0-12M6.34 17.66l1.41-1.41M17.66 17.66l-1.41-1.41"/><path d="m9 6 3-3 3 3"/></svg>`,
	SUNSET: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8M5.22 5.22l1.42 1.42M18.78 5.22l-1.42 1.42M2 12h2M20 12h2M12 18a6 6 0 1 1 0-12M6.34 17.66l1.41-1.41M17.66 17.66l-1.41-1.41"/><path d="m9 10 3 3 3-3"/></svg>`,
	IRRADIANCE: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#ffb900" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
	PRODUCTION: `<svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#00a2ad" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`
};

const formatTime = (ts) => {
	if (!ts) return "--:--";
	return ts.toPlainTime().toString({ smallestUnit: 'minutes' });
};

const createCard = (label, value, unit, time, icon, type, isTomorrow) => {
	const card = document.createElement("fluent-card");
	card.className = `summary-card ${isTomorrow ? 'tomorrow' : ''}`;
	
	let valueClass = "";
	if (type === "min") valueClass = "min";
	else if (type === "max") valueClass = "max";
	else if (type === "avg") valueClass = "avg";

	card.innerHTML = `
		${icon}
		<div class="card-label">${label}</div>
		<div class="card-value ${valueClass}">${value !== null ? value : "--"} <span class="card-unit">${unit}</span></div>
		<div class="card-time">${time || ""}</div>
	`;
	return card;
};

const getStats = (data, colIndex) => {
	if (!data || data.length === 0) return { min: null, max: null, avg: null };
	
	let minRow = data[0];
	let maxRow = data[0];
	let sum = 0;
	let count = 0;

	for (const row of data) {
		const val = row[colIndex];
		if (val === undefined || val === null) continue;
		if (val < minRow[colIndex]) minRow = row;
		if (val > maxRow[colIndex]) maxRow = row;
		sum += val;
		count++;
	}

	return {
		min: { value: minRow[colIndex], time: minRow[0] },
		max: { value: maxRow[colIndex], time: maxRow[0] },
		avg: count > 0 ? sum / count : null
	};
};

export function renderSummaryCards(containerId, priceData, radiationData, productionData) {
	const container = document.getElementById(containerId);
	if (!container) return;
	container.innerHTML = "";

	const dkNow = Temporal.Now.zonedDateTimeISO("Europe/Copenhagen");
	const today = dkNow.toPlainDate();
	const tomorrow = today.add({ days: 1 });

	// Filter data by day
	const getDayData = (ts, date) => ts.data.filter(row => row[0].toPlainDate().equals(date));

	const priceToday = getDayData(priceData.forecast, today);
	const priceTomorrow = getDayData(priceData.forecast, tomorrow);

	const radiationToday = getDayData(radiationData.forecast, today);
	const radiationTomorrow = getDayData(radiationData.forecast, tomorrow);

	const productionToday = getDayData(productionData.forecast, today);
	const productionTomorrow = getDayData(productionData.forecast, tomorrow);

	const transitToday = radiationData.transit.data.find(row => row[0].toPlainDate().equals(today));
	const transitTomorrow = radiationData.transit.data.find(row => row[0].toPlainDate().equals(tomorrow));

	const renderDay = (date, prices, radiation, production, transit, isTomorrow) => {
		const priceStats = getStats(prices, 1);
		const radiationStats = getStats(radiation, 3); // Tilted Irradiance is column 3 (0: ts, 1: direct, 2: diffuse, 3: tilted)
		
		// Production stats - today's total energy
		const energyToday = production.length > 0 ? production[production.length - 1][2] : null; // AccumulatedEnergyProduction is column 3, but let's check index. 
		// Column indices for production: 0: ts, 1: power, 2: energy, 3: accumulated
		// We want total for the day. If it's accumulated, we take the last one of the day.
		// Wait, solar-production.js says:
		// const powerProduction = new Column("PowerProduction", "Power", "KiloW", "kW")
		// const energyProduction = new Column("EnergyProduction", "Energy", "KiloW-HR", "kWh")
		// const accumulatedEnergyProduction = new Column("AccumulatedEnergyProduction", "Energy", "KiloW-HR", "kWh")
		// So 1 is Power, 2 is Energy (period), 3 is Accumulated.
		// Total for day is sum of column 2.
		const totalEnergy = production.reduce((sum, row) => sum + (row[2] || 0), 0);

		// Min Price
		container.appendChild(createCard(
			"Min Price", 
			priceStats.min?.value.toFixed(2), 
			"DKK", 
			formatTime(priceStats.min?.time), 
			ICONS.PRICE_MIN, "min", isTomorrow
		));

		// Avg Price
		container.appendChild(createCard(
			"Avg Price", 
			priceStats.avg?.toFixed(2), 
			"DKK", 
			"", 
			ICONS.PRICE_AVG, "avg", isTomorrow
		));

		// Max Price
		container.appendChild(createCard(
			"Max Price", 
			priceStats.max?.value.toFixed(2), 
			"DKK", 
			formatTime(priceStats.max?.time), 
			ICONS.PRICE_MAX, "max", isTomorrow
		));

		// Sunrise
		container.appendChild(createCard(
			"Sunrise", 
			transit ? formatTime(transit[1]) : "--:--", 
			"", 
			"", 
			ICONS.SUNRISE, "neutral", isTomorrow
		));

		// Max Irradiance
		container.appendChild(createCard(
			"Max Irrad.", 
			radiationStats.max?.value.toFixed(0), 
			"W/m²", 
			formatTime(radiationStats.max?.time), 
			ICONS.IRRADIANCE, "max", isTomorrow
		));

		// Production
		container.appendChild(createCard(
			"Production", 
			totalEnergy.toFixed(1), 
			"kWh", 
			"", 
			ICONS.PRODUCTION, "neutral", isTomorrow
		));

		// Sunset
		container.appendChild(createCard(
			"Sunset", 
			transit ? formatTime(transit[2]) : "--:--", 
			"", 
			"", 
			ICONS.SUNSET, "neutral", isTomorrow
		));
	};

	renderDay(today, priceToday, radiationToday, productionToday, transitToday, false);
	renderDay(tomorrow, priceTomorrow, radiationTomorrow, productionTomorrow, transitTomorrow, true);
}
