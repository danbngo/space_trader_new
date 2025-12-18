const SOL = new Star("Sol", hexToRgba('#ffff44'), 109, 0, 0);

const MERCURY = new Planet("Mercury", hexToRgba('#aaaaaa'), 0.383, 0, 0, new Orbit(0.39), PLANET_TYPES.TERRESTRIAL);
const VENUS = new Planet("Venus", hexToRgba('#e5c07b'), 0.949, 0, 0, new Orbit(0.72), PLANET_TYPES.GAS_DWARF);
const EARTH = new Planet("Earth", hexToRgba('#4a90e2'), 1.0, 0, 0, new Orbit(1.0), PLANET_TYPES.EARTHLIKE);
const MARS = new Planet("Mars", hexToRgba('#b22222'), 0.532, 0, 0, new Orbit(1.52), PLANET_TYPES.TERRESTRIAL);
const JUPITER = new Planet("Jupiter", hexToRgba('#d2b48c'), 11.21, 0, 0, new Orbit(5.2), PLANET_TYPES.GAS_GIANT);
const SATURN = new Planet("Saturn", hexToRgba('#f5deb3'), 9.45, 0, 0, new Orbit(9.58), PLANET_TYPES.GAS_GIANT);
const URANUS = new Planet("Uranus", hexToRgba('#afeeee'), 4.01, 0, 0, new Orbit(19.2), PLANET_TYPES.ICE_GIANT);
const NEPTUNE = new Planet("Neptune", hexToRgba('#4169e1'), 3.88, 0, 0, new Orbit(30.05), PLANET_TYPES.ICE_GIANT);
const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]

SOL.addChildren(PLANETS)

const SOLAR_SYSTEM = new StarSystem('Sol System', hexToRgba('#ffff44'), 1, 0, 0, SOL, [SOL], PLANETS, [], [])

