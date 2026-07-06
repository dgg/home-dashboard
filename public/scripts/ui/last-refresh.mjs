const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false
})

export class LastRefreshCard extends HTMLElement {
	#fetchedAt = null

	constructor() {
		super()
		this.attachShadow({ mode: "open" })
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}

	get fetchedAt() {
		return this.#fetchedAt
	}

	set fetchedAt(value) {
		this.#fetchedAt = value
		this.#update()
	}

	#update() {
		this.shadowRoot.getElementById("last-refresh").textContent = DATE_FORMATTER.format(this.#fetchedAt.toInstant())
	}
}

const response = await fetch(new URL("../../components/last-refresh.template.html", import.meta.url))
const templateContent = await response.text()

const template = document.createElement("template")
template.innerHTML = templateContent

customElements.define("last-refresh", LastRefreshCard)
