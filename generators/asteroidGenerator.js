function generateAsteroidBelts(radius = 1, numBelts = 1) {
    const asteroidBelts = []
    const beltDistances = []
    beltLoop: for (let i = 0; i < numBelts; i++) {
        const beltDistance = radius* (0.2 + 0.6*Math.random())
        //if too close to any existing belt distance, skip
        for (const existingBeltDistance of beltDistances) {
            if (Math.abs(existingBeltDistance - beltDistance) < radius*0.1) {
                continue beltLoop
            }
        }
        beltDistances.push(beltDistance)
    }
    for (const beltDistance of beltDistances) {
        const belt = new AsteroidBelt("Asteroid Belt", COLORS.Gray, 0, 0, 0, new Orbit(beltDistance, Math.random()))
        asteroidBelts.push(belt)
    }
    return asteroidBelts
}

function generateAsteroids(asteroidBelt = new AsteroidBelt(), averageColor = COLORS.Gray, numAsteroids = 1000, maxRadiusDifference = 0.2) {
    const asteroids = []
    const beltDistance = asteroidBelt.orbit.radius

    function randomizeColor(baseColor = [128,128,128,255], variation = 32) {
        const r = Math.max(Math.min(baseColor[0] + rng(-variation, variation), 255), 0)
        const g = Math.max(Math.min(baseColor[1] + rng(-variation, variation), 255), 0)
        const b = Math.max(Math.min(baseColor[2] + rng(-variation, variation), 255), 0)
        return [r, g, b, 255]
    }

    for (let i = 0; i < numAsteroids; i++) {
        const distMod = 1 + (maxRadiusDifference*(inverseNormalCurve( Math.random() )-0.5)) - (maxRadiusDifference*(inverseNormalCurve( Math.random() )-0.5))
        const distance = beltDistance * distMod
        let [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
        //y *= Math.random()
        const color = randomizeColor(averageColor, 32)
        //minutes
        const radius = Math.min(rng(3, 0.5, false), rng(3, 0.5, false), rng(3, 0.5, false), rng(3, 0.5, false), rng(3, 0.5, false))
        const asteroid = new Asteroid("", color, radius, x, y, new Orbit(distance, Math.random()))
        asteroids.push(asteroid)
    }
    return asteroids
}