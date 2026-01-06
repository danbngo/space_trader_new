/**
 * Represents a polygon geometric shape.
 * @class
 */
class Polygon {
    /**
     * Creates a polygon from vertices.
     * @param {Array<[number, number]>} vertices - Array of [x, y] coordinate pairs defining the polygon vertices.
     */
    constructor(vertices = []) {
        this.vertices = vertices;
    }

    /**
     * Checks if a point lies within the polygon using ray casting algorithm.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} True if the point is inside the polygon.
     */
    containsPoint(x, y) {
        let inside = false;
        const vertices = this.vertices;
        
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i][0], yi = vertices[i][1];
            const xj = vertices[j][0], yj = vertices[j][1];
            
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }

    /**
     * Checks if a circle intersects with this polygon.
     * This is done by checking:
     * 1. If the circle's center is inside the polygon
     * 2. If any edge of the polygon intersects with the circle
     * 3. If any vertex of the polygon is inside the circle
     * 
     * @param {number} cx - The x-coordinate of the circle's center.
     * @param {number} cy - The y-coordinate of the circle's center.
     * @param {number} radius - The radius of the circle.
     * @returns {boolean} True if the circle intersects with the polygon.
     */
    circleIntersectsWithPolygon(cx, cy, radius) {
        // Check if circle center is inside polygon
        if (this.containsPoint(cx, cy)) {
            return true;
        }

        // Check if any vertex is inside the circle
        for (const [vx, vy] of this.vertices) {
            const dx = cx - vx;
            const dy = cy - vy;
            if (dx * dx + dy * dy <= radius * radius) {
                return true;
            }
        }

        // Check if any edge intersects with the circle
        for (let i = 0; i < this.vertices.length; i++) {
            const j = (i + 1) % this.vertices.length;
            const [x1, y1] = this.vertices[i];
            const [x2, y2] = this.vertices[j];
            
            if (this.lineSegmentIntersectsCircle(x1, y1, x2, y2, cx, cy, radius)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Helper method to check if a line segment intersects with a circle.
     * @param {number} x1 - Start x of line segment.
     * @param {number} y1 - Start y of line segment.
     * @param {number} x2 - End x of line segment.
     * @param {number} y2 - End y of line segment.
     * @param {number} cx - Circle center x.
     * @param {number} cy - Circle center y.
     * @param {number} radius - Circle radius.
     * @returns {boolean} True if line segment intersects circle.
     */
    lineSegmentIntersectsCircle(x1, y1, x2, y2, cx, cy, radius) {
        // Vector from line start to line end
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Vector from line start to circle center
        const fx = x1 - cx;
        const fy = y1 - cy;
        
        // Quadratic equation coefficients for line-circle intersection
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - radius * radius;
        
        let discriminant = b * b - 4 * a * c;
        
        // No intersection if discriminant is negative
        if (discriminant < 0) {
            return false;
        }
        
        // Calculate the two possible intersection points along the line
        discriminant = Math.sqrt(discriminant);
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);
        
        // Check if either intersection point is within the line segment (0 <= t <= 1)
        return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
    }

    /**
     * Transforms the polygon by scaling, rotation, and translation.
     * @param {number} scale - Scale factor.
     * @param {number} angle - Rotation angle in radians.
     * @param {number} tx - Translation x.
     * @param {number} ty - Translation y.
     * @returns {Polygon} A new polygon with transformed vertices.
     */
    transform(scale, angle, tx, ty) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const transformedVertices = this.vertices.map(([x, y]) => {
            // Scale
            const sx = x * scale;
            const sy = y * scale;
            
            // Rotate
            const rx = sx * cos - sy * sin;
            const ry = sx * sin + sy * cos;
            
            // Translate
            return /** @type {[number, number]} */ ([rx + tx, ry + ty]);
        });
        
        return new Polygon(transformedVertices);
    }
}
