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
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {Orbit} orbit - The orbit (null for primary star, or orbit for binary systems).
     * @param {number} magnetosphereRadius - Radius of magnetosphere/heliosphere in AU.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, magnetosphereRadius = 0) {
        super(name, color, radius, x, y, orbit);
        /** @type {number} - Radius of magnetosphere/heliosphere in AU */
        this.magnetosphereRadius = magnetosphereRadius
    }
}
