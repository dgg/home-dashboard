import { formatDuration, formatTime } from "./card-formatter.mjs"

import { COL_SUNRISE, COL_SUNSET } from "../api/solar-irradiance.mjs"

export class SolarTransitCard extends HTMLElement {
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
		if (!this.#data || !this.#data.transit || !this.#data.transit.data) return
		const transit = this.#data.transit.data[this.#dayIndex]
		if (!transit) return

		const sunrise = transit[COL_SUNRISE]
		this.shadowRoot.getElementById("sunrise-val").textContent = formatTime(sunrise)

		const sunset = transit[COL_SUNSET]
		this.shadowRoot.getElementById("sunset-val").textContent = formatTime(sunset)

		const daylight = sunset.since(sunrise)
		this.shadowRoot.getElementById("daylight-val").textContent = formatDuration(daylight)
	}
}

const response = await fetch(new URL("../../components/solar-transit-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent
customElements.define("solar-transit-card", SolarTransitCard)
