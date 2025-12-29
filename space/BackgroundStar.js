class BackgroundStar extends SpaceObject {
    constructor(x = 0, y = 0, color = COLORS.LightGray, radius = 1, twinkleDurationYear = 1) {
        super("Unnamed", color, radius, x, y);
        this.twinkleDurationYear = twinkleDurationYear;
        this.twinkleProgress = 0;
        this.twinkleProgressOffset = Math.random()
        this.reset()
    }
    twinkle(year = 0) {
        const inner = (year / this.twinkleDurationYear) % 1
        this.twinkleProgress = (inner + this.twinkleProgressOffset) % 1
        this.color[3] = Math.round(255*Math.abs(1-this.twinkleProgress*2))
    }
    reset() {
        this.twinkleProgress = Math.random()
    }
}
