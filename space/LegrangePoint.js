/**
 * Represents a Lagrange point in a two-body system (Sun-Planet).
 * @class LagrangePoint
 * @extends OrbitingObject
 */
class LagrangePoint extends OrbitingObject {
    /**
     * @param {string} name - The name of the Lagrange point (e.g., "Jupiter L4").
     * @param {number[]} color - The color for rendering.
     * @param {number} radius - The visual radius.
     * @param {Orbit} orbit - The orbit of the Lagrange point.
     * @param {Planet} parentPlanet - The planet this Lagrange point is associated with.
     * @param {number} lagrangeNumber - The Lagrange point number (1-5).
     */
    constructor(name = "Unknown Lagrange Point", color = COLORS.Gray, radius = 0.01, orbit = null, parentPlanet = null, lagrangeNumber = 4) {
        super(name, OBJECT_TYPES.ABSTRACT, color, radius, orbit);
        /** @type {Planet} */
        this.parentPlanet = parentPlanet;
        /** @type {number} */
        this.lagrangeNumber = lagrangeNumber;
    }

    /**
     * Calculates the orbit for a Lagrange point based on its parent planet and point number.
     * @param {Planet} parentPlanet - The planet to calculate Lagrange point for.
     * @param {number} lagrangeNumber - Which Lagrange point (1-5).
     * @param {Star} sun - The star (usually SOL).
     * @returns {Orbit} The orbit for this Lagrange point.
     */
    static calculateLagrangeOrbit(parentPlanet, lagrangeNumber, sun = SOL) {
        const planetOrbit = parentPlanet.orbit;
        const planetRadius = planetOrbit.radius; // AU
        
        // Approximate distances for Lagrange points
        // For low mass ratio (planet << Sun), these are good approximations
        let radius = planetRadius;
        let angleOffset = 0; // Ratio 0-1 where 0 is start of orbit, 1 is complete orbit
        
        switch (lagrangeNumber) {
            case 1: // Between Sun and planet, ~1% closer for Jupiter-like
                radius = planetRadius * 0.99;
                angleOffset = 0; // Same position as planet
                break;
            case 2: // Beyond planet from Sun, ~1% farther
                radius = planetRadius * 1.01;
                angleOffset = 0; // Same position as planet
                break;
            case 3: // Opposite side of Sun from planet
                radius = planetRadius;
                angleOffset = 0.5; // 180° = half orbit
                break;
            case 4: // 60° ahead of planet in orbit (leading Trojan)
                radius = planetRadius;
                angleOffset = 60/360; // 60° = 1/6 orbit ahead
                break;
            case 5: // 60° behind planet in orbit (trailing Trojan)
                radius = planetRadius;
                angleOffset = -60/360; // 60° = 1/6 orbit behind
                break;
        }
        
        // Create orbit with same parent as planet, but offset angle
        // progressOffset is normalized 0-1 where 0 is start, 1 is end of orbit
        const orbit = new Orbit(
            radius,
            (planetOrbit.progressOffset + angleOffset) % 1,
        );
        
        return orbit;
    }
}
