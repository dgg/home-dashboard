import { formatTime, formatValue } from "./card-formatter.mjs"

import { COL_ACC_ENERGY, COL_ENERGY, COL_POWER } from "../api/solar-production.mjs"
export class SolarProductionCard extends HTMLElement {
	#data = null
	#dayIndex = 0

	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}

	static get observedAttributes() {
		return ["day-index"]
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === "day-index") {
			this.#dayIndex = parseInt(newValue, 10) || 0
			this.#update()
		}
	}

	get dayIndex() {
		return this.#dayIndex
	}

	set dayIndex(value) {
		this.setAttribute("day-index", value)
	}

	get data() {
		return this.#data
	}

	set data(value) {
		this.#data = value
		this.#update()
	}

	#update() {
		if (!this.#data || !this.#data.forecast) return

		const kW = this.#data.forecast.header.columns[COL_POWER].symbol
		const kWh = this.#data.forecast.header.columns[COL_ENERGY].symbol

		const powerEntry = this.#data.forecast.header.columns[COL_POWER].aggregates.day(this.#dayIndex)
		const maxPowerVal = powerEntry?.max.max ?? -Infinity
		this.shadowRoot.getElementById("max-power-val").textContent = formatValue(maxPowerVal, kW, 1)
		const maxPowerTime = powerEntry?.max.ts ?? null
		this.shadowRoot.getElementById("max-power-time").textContent = formatTime(maxPowerTime)

		const energyEntry = this.#data.forecast.header.columns[COL_ENERGY].aggregates.day(this.#dayIndex)
		const maxEnergyVal = energyEntry?.max.max ?? -Infinity
		this.shadowRoot.getElementById("max-energy-val").textContent = formatValue(maxEnergyVal, kWh, 1)
		const maxEnergyTime = energyEntry?.max.ts ?? null
		this.shadowRoot.getElementById("max-energy-time").textContent = formatTime(maxEnergyTime)

		const accEnergyEntry = this.#data.forecast.header.columns[COL_ACC_ENERGY].aggregates.day(this.#dayIndex)
		const totalProduction = accEnergyEntry?.max.max ?? null
		this.shadowRoot.getElementById("total-production-val").textContent = formatValue(totalProduction, kWh)
	}
}

const response = await fetch(new URL("../../components/solar-production-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("solar-production-card", SolarProductionCard)
