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


const CORONA = new AsteroidBelt("Corona", ASTEROID_BELT_TYPES.Plasma, hexToRgba('#ffff00'), SOL.radius/EARTH_RADII_PER_AU, 0, 0, new Orbit(SOL.radius), [ENCOUNTER_TYPES.PLASMOIDS], [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
const ASTEROID_BELT = new AsteroidBelt("Asteroid Belt", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bb8844'), 0.2*2.8, 0, 0, new Orbit(2.8), [ENCOUNTER_TYPES.ASTEROIDS], [EFFECT_TYPES.DEBRIS_CLOUD])
const TROJANS = new AsteroidBelt("Trojan Asteroids", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bbbb88'), 0.5, 60, 0, new Orbit(5.2), [ENCOUNTER_TYPES.ASTEROIDS], [EFFECT_TYPES.DEBRIS_CLOUD])
const GREEKS = new AsteroidBelt("Greek Asteroids", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bbbb88'), 0.5, -60, 0, new Orbit(5.2), [ENCOUNTER_TYPES.ASTEROIDS], [EFFECT_TYPES.DEBRIS_CLOUD])
const KUIPER_BELT = new AsteroidBelt("Kuiper Belt", ASTEROID_BELT_TYPES.Icy, hexToRgba('#bbbbdd'), 50*2/5, 0, 0, new Orbit(50), [ENCOUNTER_TYPES.CRYOIDS], [EFFECT_TYPES.ICE_CLOUD])

const ASTEROIDS = generateAsteroids(ASTEROID_BELT, COLORS.Brown, 500, 0.2)
const KUIPER_ASTEROIDS = generateAsteroids(KUIPER_BELT, COLORS.LightBlue, 5000, 2/5)
const TROJAN_ASTEROIDS = generateAsteroids(TROJANS, COLORS.Gray, 100, 0.1, JUPITER.orbit.progressOffset + 0.15, 0.1)
const GREEK_ASTEROIDS = generateAsteroids(GREEKS, COLORS.Gray, 100, 0.1, JUPITER.orbit.progressOffset - 0.15, 0.1)
const SOLAR_FLARES = generateAsteroids(CORONA, COLORS.LightOrange, 100, 0.5)

const ALL_ASTEROIDS = [...ASTEROIDS, ...KUIPER_ASTEROIDS, ...TROJAN_ASTEROIDS, ...GREEK_ASTEROIDS, ...SOLAR_FLARES]

SOL.addChildren(ALL_ASTEROIDS)

const BACKGROUND_STARS = generateBackgroundStars(SOLAR_SYSTEM_RADIUS_IN_AU, 5000)

const SOLAR_SYSTEM = new StarSystem(
    'Sol System',
    hexToRgba('#ffff44'),
    KUIPER_BELT.orbit.radius,
    0, 0,
    SOL, [SOL],
    PLANETS,
    [],
    [CORONA, ASTEROID_BELT, TROJANS, GREEKS, KUIPER_BELT], [...ALL_ASTEROIDS],
    BACKGROUND_STARS
);

console.log("Generated solar system:", SOLAR_SYSTEM)