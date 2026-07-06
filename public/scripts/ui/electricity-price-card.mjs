import { formatTime, formatValue } from "./card-formatter.mjs"

export class ElectricityPriceCard extends HTMLElement {
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

		const col = this.#data.forecast.header.columns[2]
		const entry = col.aggregates.day(this.#dayIndex)
		if (!entry) return

		const symbol = col.symbol

		const minVal = entry.min.min
		this.shadowRoot.getElementById("min-val").textContent = formatValue(minVal, symbol)
		const minTime = entry.min.ts
		this.shadowRoot.getElementById("min-time").textContent = formatTime(minTime)

		const maxVal = entry.max.max
		this.shadowRoot.getElementById("max-val").textContent = formatValue(maxVal, symbol)
		const maxTime = entry.max.ts
		this.shadowRoot.getElementById("max-time").textContent = formatTime(maxTime)

		const avgVal = entry.avg.avg
		this.shadowRoot.getElementById("avg-val").textContent = formatValue(avgVal, symbol)
	}
}

const response = await fetch(new URL("../../components/electricity-price-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("electricity-price-card", ElectricityPriceCard)
