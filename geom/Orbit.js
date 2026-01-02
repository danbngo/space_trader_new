/**
 * Represents an orbital path using Kepler's laws.
 * @class
 */
class Orbit {
    /**
     * Creates an orbit.
     * @param {number} radius - The orbital radius in astronomical units (AU).
     * @param {number} progressOffset - Initial progress offset (0-1) along the orbit.
     */
    constructor(radius = 0, progressOffset = Math.random()) {
        this.radius = radius;
        this.progressOffset = progressOffset % 1;
    }

    clone() {
        return new Orbit(this.radius, this.progressOffset);
    }

    /**
     * Calculate orbital period in Earth years using Kepler's third law (P^2 = a^3).
     * @returns {number} The orbital period in years.
     */
    calcPeriod() {
        return Math.sqrt(Math.pow(this.radius, 3));
    }

    /**
     * Calculate progress along orbit as a 0-1 ratio given elapsed years.
     * @param {number} years - The current game year.
     * @returns {number} Progress along the orbit (0-1).
     */
    calcProgress(years = 0) {
        years -= GAME_START_YEAR //adjusting this to make progressOffset work correctly
        const period = this.calcPeriod();
        const naturalProgress = (years / period)
        const result = (naturalProgress + this.progressOffset) % 1;
        return result;
    }

    /**
     * Calculate the angle in radians based on orbital progress.
     * @param {number} years - The current game year.
     * @returns {number} The angle in radians.
     */
    calcAngle(years = 0) {
        const progress = this.calcProgress(years);
        const result = 2 * Math.PI * progress;
        //console.log('calcAngle:', years, progress, result);
        return result;
    }

    /**
     * Calculate x, y position relative to center based on elapsed years.
     * @param {number} years - The current game year.
     * @returns {[number, number]} The [x, y] coordinates.
     */
    calcRelativePosition(years = 0) {
        const angle = this.calcAngle(years);
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        return [x,y]
    }
}