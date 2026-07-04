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

    // Total production: last value of accumulatedEnergy column (index 3)
    const lastRow = dayRows[dayRows.length - 1]
    const totalProduction = lastRow ? lastRow[3] : null

    // Max power: max of power column (index 1)
    let maxPowerVal = -Infinity
    let maxPowerTime = null
    for (const row of dayRows) {
      const val = row[1]
      if (typeof val === "number" && val > maxPowerVal) {
        maxPowerVal = val
        maxPowerTime = row[0]
      }
    }

    // Max production: max of energy column (index 2)
    let maxEnergyVal = -Infinity
    let maxEnergyTime = null
    for (const row of dayRows) {
      const val = row[2]
      if (typeof val === "number" && val > maxEnergyVal) {
        maxEnergyVal = val
        maxEnergyTime = row[0]
      }
    }

    const pad = (v) => String(v).padStart(2, "0")
    const formatTime = (t) => t ? `${pad(t.hour)}:${pad(t.minute)}` : "-"
    const formatPower = (v) => v !== -Infinity ? `${v.toFixed(1)} kW` : "-"
    const formatEnergy = (v) => v !== -Infinity ? `${v.toFixed(1)} kWh` : "-"
    const formatTotal = (v) => v !== null ? `${v.toFixed(2)} kWh` : "-"

    this.shadowRoot.getElementById("total-production-val").textContent = formatTotal(totalProduction)

    this.shadowRoot.getElementById("max-power-time").textContent = formatTime(maxPowerTime)
    this.shadowRoot.getElementById("max-power-val").textContent = formatPower(maxPowerVal)

    this.shadowRoot.getElementById("max-production-time").textContent = formatTime(maxEnergyTime)
    this.shadowRoot.getElementById("max-production-val").textContent = formatEnergy(maxEnergyVal)
  }
}

const response = await fetch(new URL("./solar-production-card.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("solar-production-card", SolarProductionCard)
