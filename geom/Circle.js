/**
 * Represents a circle geometric shape.
 * @class
 */
class Circle {
    /**
     * Creates a circle.
     * @param {number} x - The x-coordinate of the circle's center.
     * @param {number} y - The y-coordinate of the circle's center.
     * @param {number} radius - The radius of the circle.
     */
    constructor(x = 0, y = 0, radius = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    
    /**
     * Checks if a point lies within the circle.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} True if the point is inside the circle.
     */
    containsPoint(x = 0, y = 0) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distanceSquared = dx * dx + dy * dy;
        return distanceSquared <= this.radius * this.radius;
    }
}
