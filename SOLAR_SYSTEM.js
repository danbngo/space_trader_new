const SOL = new Star("Sol", new Graphics('circle', '#ffff44', 109), 109, 0, 0);

const MERCURY = new Planet("Mercury", new Graphics('circle', '#aaaaaa', 0.383), 0.383, 0, 0, new Orbit(0.39));
const VENUS = new Planet("Venus", new Graphics('circle', '#e5c07b', 0.949), 0.949, 0, 0, new Orbit(0.72));
const EARTH = new Planet("Earth", new Graphics('circle', '#4a90e2', 1.0), 1.0, 0, 0, new Orbit(1.0));
const MARS = new Planet("Mars", new Graphics('circle', '#b22222', 0.532), 0.532, 0, 0, new Orbit(1.52));
const JUPITER = new Planet("Jupiter", new Graphics('circle', '#d2b48c', 11.21), 11.21, 0, 0, new Orbit(5.2));
const SATURN = new Planet("Saturn", new Graphics('circle', '#f5deb3', 9.45), 9.45, 0, 0, new Orbit(9.58));
const URANUS = new Planet("Uranus", new Graphics('circle', '#afeeee', 4.01), 4.01, 0, 0, new Orbit(19.2));
const NEPTUNE = new Planet("Neptune", new Graphics('circle', '#4169e1', 3.88), 3.88, 0, 0, new Orbit(30.05));
const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]

SOL.addChildren(PLANETS)

const SOLAR_SYSTEM = new StarSystem('Sol System', new Graphics('circle', '#ffffff', 1), 1, 0, 0, SOL, [SOL], PLANETS, [], [])