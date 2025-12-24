class Line {
    constructor(
        startX = 0,
        startY = 0,
        toX = 0,
        toY = 0,
        lineWidth = 1
    ) {
        this.startX = startX;
        this.startY = startY;
        this.toX = toX;
        this.toY = toY;
        this.lineWidth = lineWidth;
    }
    
    containsPoint(x = 0, y = 0) {
        // Calculate closest point on line segment to the given point
        const dx = this.toX - this.startX;
        const dy = this.toY - this.startY;
        const lengthSquared = dx * dx + dy * dy;
        
        if (lengthSquared === 0) {
            // Line is actually a point
            const dist = calcDistance(this.startX, this.startY, x, y);
            return dist <= this.lineWidth;
        }
        
        // Project point onto line, clamped to segment
        const t = Math.max(0, Math.min(1, ((x - this.startX) * dx + (y - this.startY) * dy) / lengthSquared));
        const closestX = this.startX + t * dx;
        const closestY = this.startY + t * dy;
        
        // Check distance from point to closest point on line
        const dist = calcDistance(closestX, closestY, x, y);
        return dist <= this.lineWidth;
    }
}
