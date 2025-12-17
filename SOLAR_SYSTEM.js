const SOL = new Star("Sol", '#ffff44', 109, 0, 0);

const MERCURY = new Planet("Mercury", '#aaaaaa', 0.383, 0, 0, new Orbit(0.39), PLANET_TYPES.TERRESTRIAL);
const VENUS = new Planet("Venus", '#e5c07b', 0.949, 0, 0, new Orbit(0.72), PLANET_TYPES.GAS_DWARF);
const EARTH = new Planet("Earth", '#4a90e2', 1.0, 0, 0, new Orbit(1.0), PLANET_TYPES.EARTHLIKE);
const MARS = new Planet("Mars", '#b22222', 0.532, 0, 0, new Orbit(1.52), PLANET_TYPES.TERRESTRIAL);
const JUPITER = new Planet("Jupiter", '#d2b48c', 11.21, 0, 0, new Orbit(5.2), PLANET_TYPES.GAS_GIANT);
const SATURN = new Planet("Saturn", '#f5deb3', 9.45, 0, 0, new Orbit(9.58), PLANET_TYPES.GAS_GIANT);
const URANUS = new Planet("Uranus", '#afeeee', 4.01, 0, 0, new Orbit(19.2), PLANET_TYPES.ICE_GIANT);
const NEPTUNE = new Planet("Neptune", '#4169e1', 3.88, 0, 0, new Orbit(30.05), PLANET_TYPES.ICE_GIANT);
const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]

SOL.addChildren(PLANETS)

const SOLAR_SYSTEM = new StarSystem('Sol System', '#ffff44', 1, 0, 0, SOL, [SOL], PLANETS, [], [])

SOL.shaders = [createSpotsShader(255, 128, 0, 2000, 0.5), createSpotsShader(255, 255, 128, 250, 0.2)]
MERCURY.shaders = [createSpotsShader(0, 0, 0, 2000, 0.15), createSpotsShader(255, 255, 255, 250, 0.2)]
VENUS.shaders = [createSpotsShader(192, 128, 0, 2000)]
EARTH.shaders = [createContinentsShader()]
MARS.shaders = [createSpotsShader(64, 0, 0, 2000, 0.4)]
JUPITER.shaders = [createGasShader()]
SATURN.shaders = [createGasShader()]
URANUS.shaders = [createIceShader()]
NEPTUNE.shaders = [createIceShader()]

MERCURY.filters.set('contrast','0.8')
VENUS.filters.set('contrast','1.5')
MARS.filters.set('contrast','0.75')
MARS.filters.set('saturate','1.5')
