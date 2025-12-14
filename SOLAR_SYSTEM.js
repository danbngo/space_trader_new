const SOL = new Star("Sol", '#ffff44', 109, 0, 0);

const MERCURY = new Planet("Mercury", '#aaaaaa', 0.383, 0, 0, new Orbit(0.39));
const VENUS = new Planet("Venus", '#e5c07b', 0.949, 0, 0, new Orbit(0.72));
const EARTH = new Planet("Earth", '#4a90e2', 1.0, 0, 0, new Orbit(1.0));
const MARS = new Planet("Mars", '#b22222', 0.532, 0, 0, new Orbit(1.52));
const JUPITER = new Planet("Jupiter", '#d2b48c', 11.21, 0, 0, new Orbit(5.2));
const SATURN = new Planet("Saturn", '#f5deb3', 9.45, 0, 0, new Orbit(9.58));
const URANUS = new Planet("Uranus", '#afeeee', 4.01, 0, 0, new Orbit(19.2));
const NEPTUNE = new Planet("Neptune", '#4169e1', 3.88, 0, 0, new Orbit(30.05));
const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]

SOL.addChildren(PLANETS)

const SOLAR_SYSTEM = new StarSystem('Sol System', '#ffff44', 1, 0, 0, SOL, [SOL], PLANETS, [], [])