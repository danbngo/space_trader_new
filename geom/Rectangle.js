class Rectangle {
    constructor(x = 0, y = 0, width = 1, height = 1, angle = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle; // in radians, 0 = aligned with +X axis

        // Calculate the four corner points
        this.points = [
            [ this.x - (this.width / 2), this.y - (this.height / 2) ], // Top left
            [ this.x + (this.width / 2), this.y - (this.height / 2) ], // Top right
            [ this.x + (this.width / 2), this.y + (this.height / 2) ], // Bottom right
            [ this.x - (this.width / 2), this.y + (this.height / 2) ]  // Bottom left
        ];

        // Apply rotation if needed
        if (this.angle) {
            for (let i = 0; i < this.points.length; i++) {
                const [px, py] = this.points[i];
                const [rotatedX, rotatedY] = rotatePoint(px, py, this.x, this.y, this.angle);
                this.points[i] = [rotatedX, rotatedY];
            }
        }
    }

    containsPoint(x = 0, y = 0) {
        // Translate point into rectangle space
        const dx = x - this.x;
        const dy = y - this.y;
        
        // Rotate point by -angle (undo rectangle angle)
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;
        
        // Check if point is within axis-aligned rectangle bounds
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight;
    }

    static fromPath(x1 = 0, y1 = 0, x2 = 0, y2 = 0, width = 1) {
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const length = calcDistance(x1, y1, x2, y2);
        const angle = Math.atan2(y2 - y1, x2 - x1);
        return new Rectangle(centerX, centerY, length, width, angle);
    }
}
