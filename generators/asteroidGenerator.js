
/**
 * Generates a field of asteroids for an asteroid belt.
 * @param {AsteroidBelt} asteroidBelt - The asteroid belt to populate.
 * @param {number[]} averageColor - The average RGBA color for asteroids.
 * @param {number} numAsteroids - Number of asteroids to generate.
 * @param {number} maxRadius - Maximum radius for asteroids.
 * @param {number|null} startingProgress - Starting orbital progress or null for random.
 * @param {number} maxProgressDifference - Max variation in orbital progress.
 * @returns {Asteroid[]} Array of generated asteroids.
 */
function generateAsteroids(asteroidBelt = new AsteroidBelt(), averageColor = COLORS.Gray, numAsteroids = 1000, maxRadius = 3, startingProgress = null, maxProgressDifference = 1) {
    const asteroids = []
    const beltDistance = asteroidBelt.orbit.radius
    const maxOrbitalRadiusDifference = asteroidBelt.maxOrbitalRadiusDifference

    function randomizeColor(baseColor = [128,128,128,255], variation = 4) {
        const r = Math.max(Math.min(baseColor[0] + rng(-variation, variation), 255), 0)
        const g = Math.max(Math.min(baseColor[1] + rng(-variation, variation), 255), 0)
        const b = Math.max(Math.min(baseColor[2] + rng(-variation, variation), 255), 0)
        return [r, g, b, 1]
    }

    for (let i = 0; i < numAsteroids; i++) {
        const distMod = 1 + (maxOrbitalRadiusDifference*(inverseNormalCurve( Math.random() )-0.5)) - (maxOrbitalRadiusDifference*(inverseNormalCurve( Math.random() )-0.5))
        const distance = beltDistance * distMod
        //y *= Math.random()
        const color = randomizeColor(averageColor, 4)
        //minutes
        const radius = Math.min(rng(maxRadius, maxRadius/2, false))
        const progress = startingProgress !== null ? startingProgress + rng(maxProgressDifference, 0, false) - rng(maxProgressDifference, 0, false) : Math.random()
        const asteroid = new Asteroid("", color, radius, new Orbit(distance, progress), asteroidBelt)
        asteroids.push(asteroid)
    }
    return asteroids
}

function generateAsteroidShape(baseRadius = 1.0, irregularity = 0.35, chunkiness = 0.4) {
    // Start with 8-12 points around a circle (octagon-ish base)
    const numPoints = rng(12, 8);
    const angleStep = (Math.PI * 2) / numPoints;
    /** @type {Array<[number, number]>} */
    const vertices = [];
    
    for (let i = 0; i < numPoints; i++) {
        const angle = angleStep * i;
        // Add irregularity to radius (each point varies)
        const radiusVariation = 1.0 + (Math.random() - 0.5) * irregularity;
        const r = baseRadius * radiusVariation;
        
        // Randomly decide if this should be a "chunk" (indentation)
        const isChunk = Math.random() < chunkiness;
        const chunkDepth = isChunk ? 0.6 + Math.random() * 0.3 : 1.0; // 60-90% depth for chunks
        
        const x = Math.cos(angle) * r * chunkDepth;
        const y = Math.sin(angle) * r * chunkDepth;
        
        vertices.push([x, y]);
    }
    
    return vertices;
}