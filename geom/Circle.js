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
    
    /**
     * Checks if a line segment intersects with the circle.
     * @param {number} x1 - The x-coordinate of the line's start point.
     * @param {number} y1 - The y-coordinate of the line's start point.
     * @param {number} x2 - The x-coordinate of the line's end point.
     * @param {number} y2 - The y-coordinate of the line's end point.
     * @returns {boolean} True if the line segment intersects the circle.
     */
    intersectsLine(x1, y1, x2, y2) {
        // Vector from line start to line end
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Vector from line start to circle center
        const fx = x1 - this.x;
        const fy = y1 - this.y;
        
        // Quadratic equation coefficients for line-circle intersection
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - this.radius * this.radius;
        
        const discriminant = b * b - 4 * a * c;
        
        // No intersection if discriminant is negative
        if (discriminant < 0) {
            return false;
        }
        
        // Check if intersection points lie within the line segment [0, 1]
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDiscriminant) / (2 * a);
        const t2 = (-b + sqrtDiscriminant) / (2 * a);
        
        // Intersection occurs if either t1 or t2 is in [0, 1]
        return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
    }
}
