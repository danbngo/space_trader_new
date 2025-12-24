class Circle {
    constructor(x = 0, y = 0, radius = 1) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    
    containsPoint(x = 0, y = 0) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distanceSquared = dx * dx + dy * dy;
        return distanceSquared <= this.radius * this.radius;
    }
}
