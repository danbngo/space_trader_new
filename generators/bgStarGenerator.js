function generateBackgroundStars(radius = 1, numStars = 1) {
    const backgroundStars = []
    let totalX = 0;
    let totalY = 0;
    for (let i = 0; i < numStars; i++) {
        const distance = radius*Math.random()//*Math.random()*radius
        let [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
        totalX += x
        totalY += y
        //y *= Math.random()
        const r = rng(255,128)
        const g = rng(255,128)
        const b = rng(255,128)
        //minutes
        const twinkleDurationYear = 1/365/24 * rng(5*1000,5,false)
        const size = Math.min(rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), rng(0.5, 2.5, false), )
        //const color = `rgba(${r},${g},${b})`
        const bgStar = new BackgroundStar(r, g, b, x, y, size, twinkleDurationYear)
        backgroundStars.push(bgStar)
    }
    console.log('bg star average position', totalX/numStars/radius, totalY/numStars/radius)
    return backgroundStars
}