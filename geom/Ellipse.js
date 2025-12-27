/**
 * Represents an ellipse geometric shape that can be rotated.
 * @class
 */
class Ellipse {
    /**
     * Creates an ellipse.
     * @param {number} x - The x-coordinate of the ellipse's center.
     * @param {number} y - The y-coordinate of the ellipse's center.
     * @param {number} radiusX - Half-width (local X axis).
     * @param {number} radiusY - Half-height (local Y axis).
     * @param {number} angle - Rotation angle in radians, 0 = aligned with +X.
     */
    constructor(
        x = 0,
        y = 0,
        radiusX = 1,   // half-width (local X axis)
        radiusY = 1,    // half-height (local Y axis)
        angle = 0    // radians, 0 = aligned with +X
    ) {
        this.x = x;
        this.y = y;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.angle = angle;
    }
    
    /**
     * Checks if a point lies within the ellipse.
     * @param {number} x - The x-coordinate of the point.
     * @param {number} y - The y-coordinate of the point.
     * @returns {boolean} True if the point is inside the ellipse.
     */
    containsPoint(x = 0, y = 0) {
        // 1. Translate point into ellipse space
        const dx = x - this.x;
        const dy = y - this.y;
        
        // 2. Rotate point by -angle (undo ellipse angle)
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        
        const localX =  dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;
        
        // 3. Axis-aligned ellipse test
        const nx = localX / this.radiusX;
        const ny = localY / this.radiusY;
        
        return (nx * nx + ny * ny) <= 1;
    }

    /*calcClosestPoint(x = 0, y = 0) {
        // Translate
        const dx = x - this.x;
        const dy = y - this.y;

        // Rotate into local space
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const lx =  dx * cos + dy * sin;
        const ly = -dx * sin + dy * cos;

        // Solve locally
        const local = this.closestPointOnEllipseLocal(lx, ly);

        // Rotate back
        return [
            this.x + local[0] * cos - local[1] * sin,
            this.y + local[0] * sin + local[1] * cos
        ];
    }

    closestPointOnEllipseLocal(x = 0, y = 0) {
        if (this.containsPoint(x,y)) return [x,y]

        const a = this.radiusX;
        const b = this.radiusY;
        
        // Handle center case
        if (x === 0 && y === 0) {
            return [ a, 0 ];
        }

        let t = 0;
        for (let i = 0; i < 8; i++) { // 6–8 iterations is plenty
            const tx = t + a * a;
            const ty = t + b * b;

            const fx =
            (a * a * x * x) / (tx * tx) +
            (b * b * y * y) / (ty * ty) - 1;

            if (Math.abs(fx) < 1e-6) break;

            const dfx =
            (-2 * a * a * x * x) / (tx * tx * tx) +
            (-2 * b * b * y * y) / (ty * ty * ty);

            t -= fx / dfx;
            t = Math.max(t, 0);
        }

        return [
            (a * a * x) / (t + a * a),
            (b * b * y) / (t + b * b),
        ];
    }*/
}