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
		if (!this.#data || !this.#data.forecast || !this.#data.forecast.data) return

		const uniqueDates = []
		for (const row of this.#data.forecast.data) {
			const dateStr = row[0].toPlainDate().toString()
			if (!uniqueDates.includes(dateStr)) {
				uniqueDates.push(dateStr)
			}
		}
		uniqueDates.sort()

		const targetDateStr = uniqueDates[this.#dayIndex]
		if (!targetDateStr) return

		const targetPlainDate = Temporal.PlainDate.from(targetDateStr)
		const dayRows = this.#data.forecast.data.filter(row => row[0].toPlainDate().equals(targetPlainDate))

		if (dayRows.length === 0) return

		let minVal = Infinity
		let minTime = null
		let maxVal = -Infinity
		let maxTime = null
		let sumVal = 0
		let count = 0

		for (const row of dayRows) {
			const val = row[2] // actualPrice column
			if (typeof val === "number") {
				if (val < minVal) {
					minVal = val
					minTime = row[0]
				}
				if (val > maxVal) {
					maxVal = val
					maxTime = row[0]
				}
				sumVal += val
				count++
			}
		}

		const avgVal = count > 0 ? sumVal / count : null

		const pad = (v) => String(v).padStart(2, "0")
		const formatTime = (t) => t ? `${pad(t.hour)}:${pad(t.minute)}` : "-"
		const formatVal = (v) => typeof v === "number" ? `${v.toFixed(2)} DKK/kWh` : "-"

		this.shadowRoot.getElementById("min-time").textContent = formatTime(minTime)
		this.shadowRoot.getElementById("min-val").textContent = formatVal(minVal)

		this.shadowRoot.getElementById("avg-val").textContent = formatVal(avgVal)

		this.shadowRoot.getElementById("max-time").textContent = formatTime(maxTime)
		this.shadowRoot.getElementById("max-val").textContent = formatVal(maxVal)
	}
}

const response = await fetch(new URL("../../components/electricity-price-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("electricity-price-card", ElectricityPriceCard)
