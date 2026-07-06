import { formatTime, formatValue } from "./card-formatter.mjs"

import { COL_DIFFUSE, COL_DIRECT, COL_TILTED } from "../api/solar-irradiance.mjs"

export class SolarIrradianceCard extends HTMLElement {
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
		if (!this.#data || !this.#data.transit || !this.#data.transit.data || !this.#data.forecast) return

		// same unit for all values
		const symbol = this.#data.forecast.header.columns[COL_TILTED].symbol

		const tiltedEntry = this.#data.forecast.header.columns[COL_TILTED].aggregates.day(this.#dayIndex)
		const tiltedVal = tiltedEntry?.max.max ?? Infinity
		this.shadowRoot.getElementById("tilted-val").textContent = formatValue(tiltedVal, symbol, 1)
		const tiltedTime = tiltedEntry?.max.ts ?? null
		this.shadowRoot.getElementById("tilted-time").textContent = formatTime(tiltedTime)

		const directEntry = this.#data.forecast.header.columns[COL_DIRECT].aggregates.day(this.#dayIndex)
		const directVal = directEntry?.max.max ?? Infinity
		this.shadowRoot.getElementById("direct-val").textContent = formatValue(directVal, symbol, 1)
		const directTime = directEntry?.max.ts ?? null
		this.shadowRoot.getElementById("direct-time").textContent = formatTime(directTime)

		const diffuseEntry = this.#data.forecast.header.columns[COL_DIFFUSE].aggregates.day(this.#dayIndex)
		const diffuseVal = diffuseEntry?.max.max ?? Infinity
		this.shadowRoot.getElementById("diffuse-val").textContent = formatValue(diffuseVal, symbol, 1)
		const diffuseTime = diffuseEntry?.max.ts ?? null
		this.shadowRoot.getElementById("diffuse-time").textContent = formatTime(diffuseTime)
	}
}

const response = await fetch(new URL("../../components/solar-irradiance-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("solar-irradiance-card", SolarIrradianceCard)
