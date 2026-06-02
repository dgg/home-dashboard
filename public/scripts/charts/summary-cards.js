/**
 * Helper to render summary cards
 */

const ICONS = {
	PRICE_MIN: `<svg class="card-icon" viewBox="0 0 24 24" fill="#107c10"><path d="M7 15.5c0 .28.22.5.5.5h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0-.5.5ZM7.5 12h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1ZM7.5 9h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1ZM12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm5 14.5a1.5 1.5 0 0 0 0-3h-.08a1.5 1.5 0 1 0-9.84 0h-.08a1.5 1.5 0 0 0 0 3h10Z"/></svg>`,
	PRICE_AVG: `<svg class="card-icon" viewBox="0 0 24 24" fill="#0078d4"><path d="M3.5 17a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5ZM7.5 14a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5ZM11.5 11a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8a.5.5 0 0 1 .5-.5ZM16 7.5a.5.5 0 0 0-1 0v12a.5.5 0 0 0 1 0v-12ZM20 4.5a.5.5 0 0 0-1 0v15a.5.5 0 0 0 1 0v-15Z"/></svg>`,
	PRICE_MAX: `<svg class="card-icon" viewBox="0 0 24 24" fill="#d13438"><path d="M7 15.5c0 .28.22.5.5.5h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0-.5.5ZM7.5 12h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1ZM7.5 9h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1ZM12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm5 14.5a1.5 1.5 0 0 0 0-3h-.08a1.5 1.5 0 1 0-9.84 0h-.08a1.5 1.5 0 0 0 0 3h10Z"/></svg>`,
	SUNRISE: `<svg class="card-icon" viewBox="0 0 24 24" fill="#ff8c00"><path d="M12 5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1ZM5.64 6.05a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.42 1.42L5.64 7.46a1 1 0 0 1 0-1.41ZM18.36 6.05a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0ZM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM18 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM12 9a6 6 0 0 1 6 6v2a1 1 0 1 1-2 0v-2a4 4 0 1 0-8 0v2a1 1 0 1 1-2 0v-2a6 6 0 0 1 6-6ZM5.64 17.95a1 1 0 0 1 1.41-1.42l1.42 1.42a1 1 0 1 1-1.42 1.41l-1.41-1.41ZM18.36 17.95a1 1 0 0 1-1.42-1.42l-1.41 1.42a1 1 0 1 1 1.41 1.41l1.42-1.41Z"/></svg>`,
	SUNSET: `<svg class="card-icon" viewBox="0 0 24 24" fill="#ea4335"><path d="M12 5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1ZM5.64 6.05a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.42 1.42L5.64 7.46a1 1 0 0 1 0-1.41ZM18.36 6.05a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0ZM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM18 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM12 9a6 6 0 0 1 6 6v1H6v-1a6 6 0 0 1 6-6ZM5.64 17.95a1 1 0 0 1 1.41-1.42l1.42 1.42a1 1 0 1 1-1.42 1.41l-1.41-1.41ZM18.36 17.95a1 1 0 0 1-1.42-1.42l-1.41 1.42a1 1 0 1 1 1.41 1.41l1.42-1.41Z"/></svg>`,
	IRRADIANCE: `<svg class="card-icon" viewBox="0 0 24 24" fill="#ffb900"><path d="M12 5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1ZM5.64 6.05a1 1 0 0 1 1.41 0l1.42 1.42a1 1 0 0 1-1.42 1.42L5.64 7.46a1 1 0 0 1 0-1.41ZM18.36 6.05a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0ZM3 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM18 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM5.64 17.95a1 1 0 0 1 1.41-1.42l1.42 1.42a1 1 0 1 1-1.42 1.41l-1.41-1.41ZM18.36 17.95a1 1 0 0 1-1.42-1.42l-1.41 1.42a1 1 0 1 1 1.41 1.41l1.42-1.41ZM12 21a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"/></svg>`,
	PRODUCTION: `<svg class="card-icon" viewBox="0 0 24 24" fill="#00a2ad"><path d="M12.28 2.05a1 1 0 0 1 .68.29l8 8a1 1 0 0 1-1.42 1.42L13 5.41V21a1 1 0 1 1-2 0V5.41l-6.54 6.54a1 1 0 0 1-1.42-1.42l8-8a1 1 0 0 1 .68-.28ZM12 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>`,
	CLOCK: `<svg class="time-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM13 7v4.585l3.243 3.243a1 1 0 0 1-1.415 1.415L11.5 12.915A1 1 0 0 1 11 12.207V7a1 1 0 1 1 2 0z"/></svg>`
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

	const isTimedMetric = type === 'min' || type === 'max' || label === 'Max Irrad.';
	const timeHtml = time ? `<div class="card-time ${isTimedMetric ? 'align-right' : ''}">
		${isTimedMetric ? ICONS.CLOCK : ''}
		${time}
	</div>` : '<div class="card-time"></div>';

	card.innerHTML = `
		${icon}
		<div class="card-header">
			<div class="card-label">${label}</div>
			<div class="card-unit">${unit}</div>
		</div>
		<div class="card-value ${valueClass}">${value !== null ? value : "--"}</div>
		${timeHtml}
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

	const formatDate = (date) => {
		const day = String(date.day).padStart(2, '0');
		const month = String(date.month).padStart(2, '0');
		const year = date.year;
		return `${day}-${month}-${year}`;
	};

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

	const addHeader = (title, date, isTomorrow) => {
		const header = document.createElement("div");
		header.className = `day-header ${isTomorrow ? 'tomorrow' : ''}`;
		header.innerHTML = `${title} <span class="header-date">${formatDate(date)}</span>`;
		container.appendChild(header);
	};

	const renderDay = (date, prices, radiation, production, transit, isTomorrow) => {
		const priceStats = getStats(prices, 1);
		const radiationStats = getStats(radiation, 3);
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
			ICONS.CLOCK, 
			"", 
			ICONS.SUNRISE, "neutral", isTomorrow
		));

		// Max Irradiance
		container.appendChild(createCard(
			"Max Irrad.", 
			radiationStats.max?.value.toFixed(0), 
			"W/m²", 
			formatTime(radiationStats.max?.time), 
			ICONS.IRRADIANCE, "neutral", isTomorrow
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
			ICONS.CLOCK, 
			"", 
			ICONS.SUNSET, "neutral", isTomorrow
		));
	};

	addHeader("Today", today, false);
	renderDay(today, priceToday, radiationToday, productionToday, transitToday, false);
	
	addHeader("Tomorrow", tomorrow, true);
	renderDay(tomorrow, priceTomorrow, radiationTomorrow, productionTomorrow, transitTomorrow, true);
}
