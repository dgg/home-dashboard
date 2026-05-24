export const createGradientIcon = (w, h, c1, c2) => {
	const c = document.createElement("canvas")
	c.width = w
	c.height = h
	const ctx = c.getContext("2d")
	const g = ctx.createLinearGradient(0, 0, w, 0)
	g.addColorStop(0, c1)
	g.addColorStop(1, c2)
	ctx.fillStyle = g
	ctx.fillRect(0, 0, w, h)
	return `image://${c.toDataURL()}`
}

export const createLineIcon = (w, h, color, style) => {
	const c = document.createElement("canvas")
	c.width = w
	c.height = h
	const ctx = c.getContext("2d")
	ctx.strokeStyle = color
	ctx.lineWidth = 1.5
	if (style === "dashed") ctx.setLineDash([4, 2])
	else if (style === "dotted") ctx.setLineDash([1.5, 2])
	ctx.beginPath()
	ctx.moveTo(1, h / 2)
	ctx.lineTo(w - 1, h / 2)
	ctx.stroke()
	return `image://${c.toDataURL()}`
}
