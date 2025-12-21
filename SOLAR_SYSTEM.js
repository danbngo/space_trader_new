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

const ASTEROID_BELT = new AsteroidBelt("Asteroid Belt", hexToRgba('#888888'), 0, 0, 0, new Orbit(2.8))
const KUIPER_BELT = new AsteroidBelt("Kuiper Belt", hexToRgba('#888888'), 0, 0, 0, new Orbit(50))
const ASTEROIDS = generateAsteroids(ASTEROID_BELT, COLORS.Brown, 500, 0.2)
const KUIPER_ASTEROIDS = generateAsteroids(KUIPER_BELT, COLORS.LightBlue, 5000, 20/50)

SOL.addChildren(ASTEROIDS)
SOL.addChildren(KUIPER_ASTEROIDS)

const BACKGROUND_STARS = generateBackgroundStars(SOLAR_SYSTEM_RADIUS_IN_AU, 5000)

const SOLAR_SYSTEM = new StarSystem(
    'Sol System',
    hexToRgba('#ffff44'), 1, 0, 0,
    SOL, [SOL],
    PLANETS,
    [],
    [ASTEROID_BELT, KUIPER_BELT], [...ASTEROIDS, ...KUIPER_ASTEROIDS],
    BACKGROUND_STARS
);

