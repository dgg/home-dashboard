const response = await fetch(new URL("./solar-transit-card.template.html", import.meta.url));
const html = await response.text();

const template = document.createElement("template");
template.innerHTML = html;

export class SolarTransitCard extends HTMLElement {
  #data = null;
  #dayIndex = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["day-index"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "day-index") {
      this.#dayIndex = parseInt(newValue, 10) || 0;
      this.#update();
    }
  }

  get dayIndex() {
    return this.#dayIndex;
  }

  set dayIndex(value) {
    this.setAttribute("day-index", value);
  }

  get data() {
    return this.#data;
  }

  set data(value) {
    this.#data = value;
    this.#update();
  }

  #update() {
    if (!this.#data || !this.#data.transit || !this.#data.transit.data) return;
    const row = this.#data.transit.data[this.#dayIndex];
    if (!row) return;

    const sunrise = row[1];
    const sunset = row[2];
    if (!sunrise || !sunset) return;

    const pad = (v) => String(v).padStart(2, "0");
    const sunriseStr = `${pad(sunrise.hour)}:${pad(sunrise.minute)}`;
    const sunsetStr = `${pad(sunset.hour)}:${pad(sunset.minute)}`;

    const duration = sunset.since(sunrise);
    const daylightStr = `${duration.hours}h ${duration.minutes}m`;

    this.shadowRoot.getElementById("sunrise-val").textContent = sunriseStr;
    this.shadowRoot.getElementById("daylight-val").textContent = daylightStr;
    this.shadowRoot.getElementById("sunset-val").textContent = sunsetStr;
  }
}

customElements.define("solar-transit-card", SolarTransitCard);
