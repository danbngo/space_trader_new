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
     */
    constructor(x = 0, y = 0, color = COLORS.LightGray, radius = 1) {
        super("Unnamed", OBJECT_TYPES.ABSTRACT, color, radius, x, y);
    }
}
