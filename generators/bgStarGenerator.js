/**
 * Generates a field of background stars for visual effect.
 * @param {number} radius - The radius of the area to populate with stars.
 * @param {number} numStars - Number of background stars to generate.
 * @returns {BackgroundStar[]} Array of generated background stars.
 */
function generateBackgroundStars(radius = 1, numStars = 1) {
    const backgroundStars = []
    for (let i = 0; i < numStars; i++) {
        //const distance = radius*Math.random()
        //let [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
        let x = rng(radius, -radius)
        let y = rng(radius, -radius)
        if (calcDistance(0, 0, x, y) > radius) {
            i--
            continue
        }
        //y *= Math.random()
        // Make stars mostly white with slight color variance and brightness variance
        const baseBrightness = rng(192, 64)
        const colorVariance = rng(20, 0) // Small color variance
        const r = Math.min(255, baseBrightness + rng(colorVariance, -colorVariance))
        const g = Math.min(255, baseBrightness + rng(colorVariance, -colorVariance))
        const b = Math.min(255, baseBrightness + rng(colorVariance, -colorVariance))
        const color = [r, g, b, 255]
        const size = 1// Math.min(rng(1.0, 1.0, false), rng(0.9, 1.0, false))
        //const color = `rgba(${r},${g},${b})`
        const bgStar = new BackgroundStar(x, y, color, size)
        backgroundStars.push(bgStar)
    }
    return backgroundStars
}