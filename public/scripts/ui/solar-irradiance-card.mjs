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
		if (!this.#data || !this.#data.transit || !this.#data.transit.data || !this.#data.forecast || !this.#data.forecast.data) return

		const transitRow = this.#data.transit.data[this.#dayIndex]
		if (!transitRow) return

		const transitDate = transitRow[0].toPlainDate()
		const dayRows = this.#data.forecast.data.filter(row => row[0].toPlainDate().equals(transitDate))

		if (dayRows.length === 0) return

		const tiltedMax = this.#findMax(dayRows, 3)
		const directMax = this.#findMax(dayRows, 1)
		const diffuseMax = this.#findMax(dayRows, 2)

		const pad = (v) => String(v).padStart(2, "0")
		const formatTime = (t) => t ? `${pad(t.hour)}:${pad(t.minute)}` : "-"
		const formatVal = (v) => v !== -Infinity ? `${v.toFixed(1)} W/m2` : "-"

		this.shadowRoot.getElementById("tilted-time").textContent = formatTime(tiltedMax.time)
		this.shadowRoot.getElementById("tilted-val").textContent = formatVal(tiltedMax.val)

		this.shadowRoot.getElementById("direct-time").textContent = formatTime(directMax.time)
		this.shadowRoot.getElementById("direct-val").textContent = formatVal(directMax.val)

		this.shadowRoot.getElementById("diffuse-time").textContent = formatTime(diffuseMax.time)
		this.shadowRoot.getElementById("diffuse-val").textContent = formatVal(diffuseMax.val)
	}

	#findMax(rows, colIdx) {
		let maxVal = -Infinity
		let maxTime = null
		for (const row of rows) {
			const val = row[colIdx]
			if (val > maxVal) {
				maxVal = val
				maxTime = row[0]
			}
		}
		return { val: maxVal, time: maxTime }
	}
}

const response = await fetch(new URL("../../components/solar-irradiance-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("solar-irradiance-card", SolarIrradianceCard)
