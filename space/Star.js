/**
 * Represents a star (the central object in a star system).
 * @class Star
 * @extends OrbitingObject
 */
class Star extends OrbitingObject {
    /**
     * @param {string} name - The name of the star.
     * @param {number[]} color - The color of the star.
     * @param {number} radius - The radius of the star in AU.
     * @param {Orbit} orbit - The orbit (null for primary star, or orbit for binary systems).
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, orbit = null) {
        super(name, OBJECT_TYPES.STAR, color, radius, orbit);
        /** @type {StarType} - The type/classification of the star */
        this.starType = null
        /** @type {number} - Mass in solar masses */
        this.mass = 1.0
        /** @type {number} - Surface temperature in Kelvin */
        this.temperature = 5778
    }

    /**
     * Generates an orbit from x,y coordinates relative to the star.
     * Calculates the orbital radius and progressOffset so the orbit matches the current position.
     * @param {number} x - X coordinate relative to star (in AU)
     * @param {number} y - Y coordinate relative to star (in AU)
     * @returns {Orbit} An orbit with radius and progressOffset matching the given position
     */
    getOrbitAtXY(x, y) {
        // Calculate distance from sun (orbital radius in AU)
        const distance = Math.sqrt(x * x + y * y)
        
        // Calculate angle from sun (radians, 0 to 2π)
        const angle = Math.atan2(y, x)
        
        // Convert angle to progressOffset (0-1 range)
        // Normalize negative angles to 0-1 range
        const progressOffset = ((angle / (2 * Math.PI)) + 1) % 1
        
        return new Orbit(distance, progressOffset)
    }
}
