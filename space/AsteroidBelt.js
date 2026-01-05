/**
 * @extends {OrbitingObject}
 * @param {AsteroidBeltType} asteroidBeltType - The type of the asteroid belt.
 * @param {number[]} color - The color of the asteroid belt.
 * @param {number} radius - The radius of the asteroid belt.
 * @property {AsteroidBeltType} asteroidBeltType - The type of the asteroid belt.
 * @property {EncounterType[]} miningEncounterTypes - The types of encounters that can occur when manually mining.
 * @property {EncounterType[]} hazardEncounterTypes - The types of encounters that occur when traveling through the belt.
 * @property {Orbit} orbit - The orbit of the asteroid belt.
 */
class AsteroidBelt extends OrbitingObject {
    constructor(name = "Unnamed", asteroidBeltType, color = COLORS.White, radius = 0, orbit = null, miningEncounterTypes = [], hazardEncounterTypes = [], effectTypes = [], maxOrbitalRadiusDifference = 0.2) {
        super(name, OBJECT_TYPES.ASTEROID_BELT, color, radius, orbit);
        /** @type {AsteroidBeltType} */
        this.asteroidBeltType = asteroidBeltType
        /** @type {EncounterType[]} */
        this.miningEncounterTypes = miningEncounterTypes
        /** @type {EncounterType[]} */
        this.hazardEncounterTypes = hazardEncounterTypes
        /** @type {EffectType[]} */
        this.effectTypes = effectTypes
        /** @type {number} */
        this.maxOrbitalRadiusDifference = maxOrbitalRadiusDifference
    }
    
    /**
     * Randomizes an asteroid's position within this belt's orbital radius range
     * @param {Asteroid} asteroid - The asteroid to randomize
     */
    randomizeAsteroid(asteroid) {
        const inverseNormalCurve = (x) => {
            // Simple inverse normal curve approximation
            return Math.pow(x, 0.5)
        }
        
        const distMod = 1 + (this.maxOrbitalRadiusDifference*(inverseNormalCurve(Math.random())-0.5)) - (this.maxOrbitalRadiusDifference*(inverseNormalCurve(Math.random())-0.5))
        const newDistance = this.orbit.radius * distMod
        const newProgress = Math.random()
        
        asteroid.orbit.radius = newDistance
        asteroid.orbit.progressOffset = newProgress
    }
}
