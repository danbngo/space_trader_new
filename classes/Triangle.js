class Triangle {
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

    static calcEquilateralTriangleHeight(base = 0) {
        return (Math.sqrt(3) / 2) * base;
    }
}
