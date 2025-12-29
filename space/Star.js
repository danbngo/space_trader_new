// Star class extends OrbitingObject
class Star extends OrbitingObject {
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null) {
        super(name, color, radius, x, y, orbit);
    }
}
