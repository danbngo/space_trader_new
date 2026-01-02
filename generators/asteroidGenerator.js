
//need a really big overhaul here if we move to randomly generated asteroid belts
/*function generateAsteroidBelts(radius = 1, numBelts = 1) {
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
}*/

/**
 * Generates a field of asteroids for an asteroid belt.
 * @param {AsteroidBelt} asteroidBelt - The asteroid belt to populate.
 * @param {number[]} averageColor - The average RGBA color for asteroids.
 * @param {number} numAsteroids - Number of asteroids to generate.
 * @param {number} maxRadius - Maximum radius for asteroids.
 * @param {number} maxOrbitalRadiusDifference - Max variation in orbital radius.
 * @param {number|null} startingProgress - Starting orbital progress or null for random.
 * @param {number} maxProgressDifference - Max variation in orbital progress.
 * @returns {Asteroid[]} Array of generated asteroids.
 */
function generateAsteroids(asteroidBelt = new AsteroidBelt(), averageColor = COLORS.Gray, numAsteroids = 1000, maxRadius = 3, maxOrbitalRadiusDifference = 0.2, startingProgress = null, maxProgressDifference = 1) {
    const asteroids = []
    const beltDistance = asteroidBelt.orbit.radius

    function randomizeColor(baseColor = [128,128,128,255], variation = 32) {
        const r = Math.max(Math.min(baseColor[0] + rng(-variation, variation), 255), 0)
        const g = Math.max(Math.min(baseColor[1] + rng(-variation, variation), 255), 0)
        const b = Math.max(Math.min(baseColor[2] + rng(-variation, variation), 255), 0)
        return [r, g, b, 255]
    }

    for (let i = 0; i < numAsteroids; i++) {
        const distMod = 1 + (maxOrbitalRadiusDifference*(inverseNormalCurve( Math.random() )-0.5)) - (maxOrbitalRadiusDifference*(inverseNormalCurve( Math.random() )-0.5))
        const distance = beltDistance * distMod
        //y *= Math.random()
        const color = randomizeColor(averageColor, 32)
        //minutes
        const radius = Math.min(rng(maxRadius, 0.5, false), rng(maxRadius, 0.5, false), rng(maxRadius, 0.5, false), rng(maxRadius, 0.5, false), rng(maxRadius, 0.5, false))
        const progress = startingProgress !== null ? startingProgress + rng(maxProgressDifference, 0, false) - rng(maxProgressDifference, 0, false) : Math.random()
        const asteroid = new Asteroid("", color, radius, new Orbit(distance, progress), asteroidBelt)
        asteroids.push(asteroid)
    }
    return asteroids
}