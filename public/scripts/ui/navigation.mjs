const onLinkSelected = (event) => {
	// Current active link (event.target) -> should be outline
	const activeIcon = event.target.querySelector("i")
	if (activeIcon) {
		activeIcon.className = activeIcon.className.replace("-filled", "")
	}

	// Previous active link (event.relatedTarget) -> should be filled
	if (event.relatedTarget) {
		const previousIcon = event.relatedTarget.querySelector("i")
		if (previousIcon && !previousIcon.className.includes("-filled")) {
			previousIcon.className += "-filled"
		}
	}
}

export const handleNavSelection = (linkSelector) => {
	document.querySelectorAll(linkSelector)
		.forEach(link => {
			link.addEventListener("shown.bs.tab", onLinkSelected)
		})
}
