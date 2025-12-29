class Asteroid extends OrbitingObject {
    constructor(name = "Unnamed", color = COLORS.Gray, radius = 0, x = 0, y = 0, orbit = null, belt = new AsteroidBelt()) {
        super(name, color, radius, x, y, orbit);
        this.belt = belt
    }
}
