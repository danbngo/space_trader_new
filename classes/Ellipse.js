export class Ellipse {
    constructor(cx = 0, cy = 0, majorAxis = 10, minorAxis = 5, angle = 0) {
        this.cx = cx;
        this.cy = cy;
        this.majorAxis = majorAxis;
        this.minorAxis = minorAxis;
        this.angle = angle; // in radians
    }
}