/**
 * Represents a distant background star for visual effect (twinkling animation).
 * @class BackgroundStar
 * @extends SpaceObject
 */
class BackgroundStar extends SpaceObject {
    /**
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {number[]} color - The color of the star.
     * @param {number} radius - The radius of the star.
     * @param {number} twinkleDurationYear - Duration of one twinkle cycle in game years.
     */
    constructor(x = 0, y = 0, color = COLORS.LightGray, radius = 1, twinkleDurationYear = 1) {
        super("Unnamed", OBJECT_TYPES.ABSTRACT, color, radius, x, y);
        /** @type {number} - Duration of one twinkle cycle in game years */
        this.twinkleDurationYear = twinkleDurationYear;
        /** @type {number} - Current progress through twinkle cycle (0-1) */
        this.twinkleProgress = 0;
        /** @type {number} - Random offset for twinkle timing */
        this.twinkleProgressOffset = Math.random()
        this.reset()
    }
    /**
     * Updates the twinkle animation based on current year.
     * @param {number} year - The current game year.
     */
    twinkle(year = 0) {
        const inner = (year / this.twinkleDurationYear) % 1
        this.twinkleProgress = (inner + this.twinkleProgressOffset) % 1
        this.color[3] = Math.round(255*Math.abs(1-this.twinkleProgress*2))
    }
    /**
     * Resets the twinkle progress to a random value.
     */
    reset() {
        this.twinkleProgress = Math.random()
    }
}
