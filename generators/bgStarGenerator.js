/**
 * Generates a field of background stars for visual effect.
 * @param {number} radius - The radius of the area to populate with stars.
 * @param {number} numStars - Number of background stars to generate.
 * @returns {BackgroundStar[]} Array of generated background stars.
 */
function generateBackgroundStars(radius = 1, numStars = 1) {
    const backgroundStars = []
    for (let i = 0; i < numStars; i++) {
        const distance = radius*Math.random()//*Math.random()*radius
        let [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
        //y *= Math.random()
        const r = rng(255,128)
        const g = rng(255,128)
        const b = rng(255,128)
        const color = [r, g, b, 1]
        //minutes
        const twinkleDurationYear = 1/365/24 * rng(5*1000,5,false)
        const size = Math.min(rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), )
        //const color = `rgba(${r},${g},${b})`
        const bgStar = new BackgroundStar(x, y, color, size, twinkleDurationYear)
        backgroundStars.push(bgStar)
    }
    return backgroundStars
}