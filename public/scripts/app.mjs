import { handleNavSelection } from "./ui/navigation.mjs"

const init = async () => {
	try {
		console.info("Initializing...")

		// Set up UI navigation
		handleNavSelection(".nav-minimal .nav-link")

		console.info("Initialized")

	} catch (error) {
		console.error("Initialization failed:", error)
	}
}

// Start the app when the DOM is ready
if (document.readyState === "loading") {
	console.debug("DOM loading...")
	document.addEventListener("DOMContentLoaded", init)
} else {
	console.debug("DOM already ready")
	init()
}
