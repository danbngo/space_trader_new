class OrbitingObject extends SpaceObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y);
        this.orbit = orbit;
    }
    calcAbsPositionAtYear(year = 0) {
        if (!this.orbit) return [this.x, this.y]
        let [ox, oy] = this.orbit.calcRelativePosition(year);
        if (this.parent) {
            const [px, py] = this.parent.calcAbsPositionAtYear(year)
            ox += px
            oy += py
        }
        return [ox, oy]
    }
}
