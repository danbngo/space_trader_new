console.log("Generating solar system...");

const SOL = new Star("Sol", hexToRgba('#ffff44'), 109, null, 122); // Heliosphere extends to ~122 AU
SOL.starType = STAR_TYPES.G_TYPE
SOL.mass = 1.0
SOL.temperature = 5778
SOL.features = []

const MERCURY = new Planet("Mercury", hexToRgba('#aaaaaa'), 0.383, new Orbit(0.39), PLANET_TYPES.TERRESTRIAL, null, null, 
    null,
    [PLANET_FEATURE_TYPES.IMPACT_BASIN, PLANET_FEATURE_TYPES.SMOOTH_SURFACE], 58.6, 0.0003);
const VENUS = new Planet("Venus", hexToRgba('#d4e642'), 0.949, new Orbit(0.72), PLANET_TYPES.GAS_DWARF, null, null,
    null,
    [PLANET_FEATURE_TYPES.RETROGRADE_ROTATION, PLANET_FEATURE_TYPES.GREENHOUSE_EFFECT, PLANET_FEATURE_TYPES.DENSE_CLOUDS, PLANET_FEATURE_TYPES.VOLCANIC_ACTIVITY], 243, 0.0001);
const EARTH = new Planet("Earth", hexToRgba('#4a90e2'), 1.0, new Orbit(1.0), PLANET_TYPES.EARTHLIKE, null, null,
    null,
    [PLANET_FEATURE_TYPES.STRONG_MAGNETOSPHERE, PLANET_FEATURE_TYPES.LARGE_SATELLITE, PLANET_FEATURE_TYPES.ICE_CAPS], 1.0, 0.0007);
const MARS = new Planet("Mars", hexToRgba('#b22222'), 0.532, new Orbit(1.52), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.MASSIVE_CANYON, PLANET_FEATURE_TYPES.ICE_CAPS, PLANET_FEATURE_TYPES.IMPACT_BASIN], 1.03, 0.0001);
const JUPITER = new Planet("Jupiter", hexToRgba('#d9955b'), 11.21, new Orbit(5.2), PLANET_TYPES.GAS_GIANT, null, null,
    null,
    [PLANET_FEATURE_TYPES.GREAT_STORM, PLANET_FEATURE_TYPES.STRONG_MAGNETOSPHERE, PLANET_FEATURE_TYPES.RADIATION_BELTS, PLANET_FEATURE_TYPES.FAINT_RINGS, PLANET_FEATURE_TYPES.TROJAN_ASTEROIDS], 0.41, 0.05);
const SATURN = new Planet("Saturn", hexToRgba('#faf0d7'), 9.45, new Orbit(9.58), PLANET_TYPES.GAS_GIANT, null, null,
    null,
    [PLANET_FEATURE_TYPES.RING_SYSTEM], 0.45, 0.013);
const URANUS = new Planet("Uranus", hexToRgba('#afeeee'), 4.01, new Orbit(19.2), PLANET_TYPES.ICE_GIANT, null, null,
    null,
    [PLANET_FEATURE_TYPES.EXTREME_AXIAL_TILT, PLANET_FEATURE_TYPES.FAINT_RINGS, PLANET_FEATURE_TYPES.METHANE_ATMOSPHERE], 0.72, 0.004);
const NEPTUNE = new Planet("Neptune", hexToRgba('#4169e1'), 3.88, new Orbit(30.05), PLANET_TYPES.ICE_GIANT, null, null,
    null,
    [PLANET_FEATURE_TYPES.GREAT_STORM, PLANET_FEATURE_TYPES.METHANE_ATMOSPHERE], 0.67, 0.0015);

// Dwarf Planets
const CERES = new Planet("Ceres", hexToRgba('#999999'), 0.076, new Orbit(2.77), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.WATER_ICE_SURFACE, PLANET_FEATURE_TYPES.SUBSURFACE_OCEAN], 0.38, 0);
const PLUTO = new Planet("Pluto", hexToRgba('#d4a373'), 0.186, new Orbit(39.48), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.WATER_ICE_SURFACE, PLANET_FEATURE_TYPES.NITROGEN_ATMOSPHERE, PLANET_FEATURE_TYPES.BINARY_SYSTEM], 6.4, 0);
const ERIS = new Planet("Eris", hexToRgba('#cccccc'), 0.182, new Orbit(67.7), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.WATER_ICE_SURFACE], 1.1, 0);
const HAUMEA = new Planet("Haumea", hexToRgba('#e8e8e8'), 0.128, new Orbit(43.13), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.ELONGATED_SHAPE, PLANET_FEATURE_TYPES.RAPID_ROTATION, PLANET_FEATURE_TYPES.WATER_ICE_SURFACE], 0.16, 0);
const MAKEMAKE = new Planet("Makemake", hexToRgba('#c9a687'), 0.116, new Orbit(45.79), PLANET_TYPES.TERRESTRIAL, null, null,
    null,
    [PLANET_FEATURE_TYPES.WATER_ICE_SURFACE, PLANET_FEATURE_TYPES.METHANE_ATMOSPHERE], 0.95, 0);

const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]
const DWARF_PLANETS = [CERES, PLUTO, ERIS, HAUMEA, MAKEMAKE] //getting rid of far dwarfs for now since they're past the kuiper belt

SOL.addChildren([...PLANETS, ...DWARF_PLANETS])

// Helper function to check if two craters overlap
function cratersOverlap(crater1, crater2) {
    const dx = crater1.x - crater2.x
    const dy = crater1.y - crater2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const minDistance = crater1.radius + crater2.radius
    return distance < minDistance
}

// Function to generate craters for a celestial body
function generateCraters(minCraters, maxCraters, minRadius, maxRadius) {
    const numberOfCraters = minCraters + Math.floor(Math.random() * (maxCraters - minCraters + 1))
    const craters = []
    
    for (let i = 0; i < numberOfCraters; i++) {
        let placed = false
        let attempts = 0
        const maxAttempts = 10
        
        while (!placed && attempts < maxAttempts) {
            const newCrater = {
                x: (Math.random() - 0.5) * 1.6, // Random x position from -0.8 to 0.8 (ratio of planet radius)
                y: (Math.random() - 0.5) * 1.6, // Random y position from -0.8 to 0.8
                radius: minRadius + Math.random() * (maxRadius - minRadius)
            }
            
            // Check if this crater overlaps with any existing crater
            let overlaps = false
            for (const existingCrater of craters) {
                if (cratersOverlap(newCrater, existingCrater)) {
                    overlaps = true
                    break
                }
            }
            
            if (!overlaps) {
                craters.push(newCrater)
                placed = true
            }
            
            attempts++
        }
        // If all 10 attempts failed, skip this crater and continue with the next one
    }
    
    return craters
}

// Add craters to cratered bodies
// Mercury - heavily cratered, no atmosphere
MERCURY.decorators.push(new PlanetDecorator({ craters: generateCraters(15, 25, 0.03, 0.12) }))

// Mars - moderately cratered, thin atmosphere
MARS.decorators.push(new PlanetDecorator({ craters: generateCraters(10, 20, 0.03, 0.11) }))

// Ceres - heavily cratered dwarf planet
CERES.decorators.push(new PlanetDecorator({ craters: generateCraters(12, 22, 0.04, 0.13) }))

// Pluto - some large impact basins on icy surface
PLUTO.decorators.push(new PlanetDecorator({ craters: generateCraters(5, 12, 0.04, 0.10) }))

// Eris - icy surface with moderate cratering
ERIS.decorators.push(new PlanetDecorator({ craters: generateCraters(8, 15, 0.03, 0.09) }))

// Haumea - elongated with some cratering
HAUMEA.decorators.push(new PlanetDecorator({ craters: generateCraters(6, 12, 0.03, 0.08) }))

// Makemake - icy surface with moderate cratering
MAKEMAKE.decorators.push(new PlanetDecorator({ craters: generateCraters(7, 14, 0.03, 0.09) }))


//const CORONA = new AsteroidBelt("Corona", ASTEROID_BELT_TYPES.Plasma, hexToRgba('#ffaa0022'), 0.1, new Orbit(0.2), [ENCOUNTER_TYPES.PLASMOIDS_CALM], [ENCOUNTER_TYPES.PLASMOIDS_STORM], [EFFECT_TYPES.ION_CLOUD, EFFECT_TYPES.PLASMA_TRAIL])
const ASTEROID_BELT = new AsteroidBelt("Asteroid Belt", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bb8844'), 0.2*2.8, new Orbit(2.8), [ENCOUNTER_TYPES.ASTEROIDS_CALM], [ENCOUNTER_TYPES.ASTEROIDS_STORM], [])
const TROJANS = new AsteroidBelt("Trojan Asteroids", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bbbb88'), 0.5, new Orbit(5.2, 0.25), [ENCOUNTER_TYPES.ASTEROIDS_CALM], [ENCOUNTER_TYPES.ASTEROIDS_STORM], [])
const GREEKS = new AsteroidBelt("Greek Asteroids", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bbbb88'), 0.5, new Orbit(5.2, -0.25), [ENCOUNTER_TYPES.ASTEROIDS_CALM], [ENCOUNTER_TYPES.ASTEROIDS_STORM], [])
const KUIPER_BELT = new AsteroidBelt("Kuiper Belt", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#bbbbdd'), 50*1/5, new Orbit(50), [ENCOUNTER_TYPES.CRYOIDS_CALM], [ENCOUNTER_TYPES.CRYOIDS_STORM], [])
//not going to make this particularly accurate for gameplay/processor limitation reasons
const OORT_CLOUD = new AsteroidBelt("Oort Cloud", ASTEROID_BELT_TYPES.Rocky, hexToRgba('#ddeeff'), 75*1/5, new Orbit(75), [ENCOUNTER_TYPES.CRYOIDS_CALM], [ENCOUNTER_TYPES.CRYOIDS_STORM], [], 0.5)
const ASTEROID_BELTS_ALL = [ASTEROID_BELT, TROJANS, GREEKS, KUIPER_BELT, OORT_CLOUD]

// Dimmed asteroid colors (half brightness)
const DIM_BROWN = [80, 60, 40, 1]
const DIM_LIGHT_BLUE = [86, 108, 115, 1]
const DIM_WHITE = [127, 127, 127, 1]
const DIM_GRAY = [80, 80, 80, 1]
const DIM_LIGHT_ORANGE = [127, 100, 50, 1]

const ASTEROIDS = generateAsteroids(ASTEROID_BELT, DIM_BROWN, 330, 6)
const KUIPER_ASTEROIDS = generateAsteroids(KUIPER_BELT, DIM_LIGHT_BLUE, 1670, 6)
const OORT_ASTEROIDS = generateAsteroids(OORT_CLOUD, DIM_WHITE, 2500, 4)
const TROJAN_ASTEROIDS = generateAsteroids(TROJANS, DIM_GRAY, 66, 5, JUPITER.orbit.progressOffset + 0.15, 5)
const GREEK_ASTEROIDS = generateAsteroids(GREEKS, DIM_GRAY, 66, 5, JUPITER.orbit.progressOffset - 0.15, 5)
//const SOLAR_FLARES = generateAsteroids(CORONA, DIM_LIGHT_ORANGE, 66, 2)

const ASTEROIDS_ALL = [...ASTEROIDS, ...KUIPER_ASTEROIDS, ...OORT_ASTEROIDS, ...TROJAN_ASTEROIDS, ...GREEK_ASTEROIDS]

SOL.addChildren(ASTEROIDS_ALL)

const BACKGROUND_STARS = generateBackgroundStars(SOLAR_SYSTEM_RADIUS_IN_AU*2, 5000)

// Religions and space stations will be initialized in titleMenu.js before game start
const RELIGIONS = []
const SPACE_STATIONS = []

const SOLAR_SYSTEM = new StarSystem(
    'Sol System',
    hexToRgba('#ffff44'),
    OORT_CLOUD.orbit.radius,
    SOL, [SOL],
    PLANETS,
    DWARF_PLANETS,
    [], //moons added in MOONS.js
    [],
    [],
    [ASTEROID_BELT, TROJANS, GREEKS, KUIPER_BELT, OORT_CLOUD], [...ASTEROIDS_ALL],
    BACKGROUND_STARS,
    []
);

console.log("Generated solar system:", SOLAR_SYSTEM)
console.log("Generated religions:", RELIGIONS)
console.log("Generated space stations:", SPACE_STATIONS)

// Log body counts
console.log("=== SOLAR SYSTEM BODY COUNTS ===")
console.log("Stars:", SOLAR_SYSTEM.stars.length)
console.log("Regular Planets:", SOLAR_SYSTEM.planets.length)
console.log("Dwarf Planets:", SOLAR_SYSTEM.dwarfPlanets.length)
console.log("Space Stations:", SOLAR_SYSTEM.spaceStations.length)
console.log("Asteroid Belts:", SOLAR_SYSTEM.asteroidBelts.length)
console.log("Asteroids:", SOLAR_SYSTEM.asteroids.length)
console.log("  - Main Belt Asteroids:", ASTEROIDS.length)
console.log("  - Kuiper Belt Asteroids:", KUIPER_ASTEROIDS.length)
console.log("  - Oort Cloud Asteroids:", OORT_ASTEROIDS.length)
console.log("  - Trojan Asteroids:", TROJAN_ASTEROIDS.length)
console.log("  - Greek Asteroids:", GREEK_ASTEROIDS.length)
//console.log("  - Solar Flares (Corona):", SOLAR_FLARES.length)
console.log("Background Stars:", SOLAR_SYSTEM.backgroundStars.length)
console.log("=================================")

