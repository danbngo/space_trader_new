/**
 * Represents a triangle geometric shape that can be rotated.
 * @class
 */
class Triangle {
    /**
     * Creates a triangle.
     * @param {number} x - The x-coordinate of the triangle's center.
     * @param {number} y - The y-coordinate of the triangle's center.
     * @param {number} base - The base width of the triangle.
     * @param {number} height - The height of the triangle.
     * @param {number} angle - Rotation angle in radians, 0 = pointing right.
     */
    constructor(x = 0, y = 0, base = 1, height = 1, angle = 0) {
        this.x = x;
        this.y = y;
        this.base = base;
        this.height = height;
        this.angle = angle; // in radians, 0 = pointing right

        this.points = [
            [ this.x + (this.height / 2), this.y ], // Right vertex
            [ this.x - (this.height / 2), this.y - (this.base / 2) ], // Top left vertex
            [ this.x - (this.height / 2), this.y + (this.base / 2) ]  // Bottom left vertex
        ]

        if (this.angle) {
            for (let i = 0; i < this.points.length; i++) {
                const [px, py] = this.points[i];
                const [rotatedX, rotatedY] = rotatePoint(px, py, this.x, this.y, this.angle);
                this.points[i] = [rotatedX, rotatedY];
            }
        }
    }

    /**
     * Calculates the height of an equilateral triangle given its base.
     * @param {number} base - The base of the triangle.
     * @returns {number} The height of the equilateral triangle.
     */
    static calcEquilateralTriangleHeight(base = 0) {
        return (Math.sqrt(3) / 2) * base;
    }

    /**
     * Checks if a point lies within the triangle using barycentric coordinates.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} True if the point is inside the triangle.
     */
    containsPoint(x = 0, y = 0) {
        // Apply barycentric coordinates method
        const [A, B, C] = this.points;
        
        // Compute vectors
        const v0x = C[0] - A[0];
        const v0y = C[1] - A[1];
        const v1x = B[0] - A[0];
        const v1y = B[1] - A[1];
        const v2x = x - A[0];
        const v2y = y - A[1];
        
        // Compute dot products
        const dot00 = v0x * v0x + v0y * v0y;
        const dot01 = v0x * v1x + v0y * v1y;
        const dot02 = v0x * v2x + v0y * v2y;
        const dot11 = v1x * v1x + v1y * v1y;
        const dot12 = v1x * v2x + v1y * v2y;
        
        // Compute barycentric coordinates
        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        
        // Check if point is in triangle (including edges)
        const isInside = (u >= 0) && (v >= 0) && (u + v <= 1);
        
        return isInside;
    }


}
