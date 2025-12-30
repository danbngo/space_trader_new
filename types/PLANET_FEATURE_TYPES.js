/**
 * @class PlanetFeatureType
 * @classdesc Represents a unique feature or characteristic of a planet.
 * @property {string} name - The name of the feature.
 * @property {string} description - A description of the feature.
 * @property {number[]} color - The color associated with this feature (RGBA array).
 */
class PlanetFeatureType {
    /**
     * @param {string} name - The name of the feature.
     * @param {string} description - A description of the feature.
     * @param {number[]} color - The color associated with this feature (RGBA array).
     */
    constructor(name, description, color = COLORS.White) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
    }
}

const PLANET_FEATURE_TYPES = Object.freeze({
    // Ring Systems
    RING_SYSTEM: new PlanetFeatureType("Ring System", "Spectacular rings of ice and rock orbit the planet", COLORS.LightGray),
    FAINT_RINGS: new PlanetFeatureType("Faint Rings", "Barely visible rings of dust and debris", COLORS.Gray),
    
    // Axial Properties
    EXTREME_AXIAL_TILT: new PlanetFeatureType("Extreme Axial Tilt", "Planet rotates on its side, causing extreme seasonal variations", COLORS.Cyan),
    RETROGRADE_ROTATION: new PlanetFeatureType("Retrograde Rotation", "Planet rotates backwards compared to its orbit", COLORS.Purple),
    RAPID_ROTATION: new PlanetFeatureType("Rapid Rotation", "Extremely fast rotation causes flattened poles", COLORS.Yellow),
    TIDALLY_LOCKED: new PlanetFeatureType("Tidally Locked", "One face always points toward its star", COLORS.Orange),
    
    // Atmospheric Features
    GREAT_STORM: new PlanetFeatureType("Great Storm", "Massive perpetual storm system visible from space", COLORS.Red),
    DENSE_CLOUDS: new PlanetFeatureType("Dense Cloud Cover", "Thick cloud layers obscure the surface", COLORS.White),
    GREENHOUSE_EFFECT: new PlanetFeatureType("Runaway Greenhouse", "Extreme greenhouse effect creates hellish temperatures", COLORS.Orange),
    
    // Surface Features
    VOLCANIC_ACTIVITY: new PlanetFeatureType("Active Volcanism", "Intense volcanic activity reshapes the surface", COLORS.DarkRed),
    ICE_CAPS: new PlanetFeatureType("Polar Ice Caps", "Frozen water at the planet's poles", COLORS.White),
    CRYOVOLCANISM: new PlanetFeatureType("Cryovolcanism", "Volcanoes that erupt ice and frozen gases", COLORS.LightBlue),
    SUBSURFACE_OCEAN: new PlanetFeatureType("Subsurface Ocean", "Liquid ocean hidden beneath ice shell", COLORS.DarkBlue),
    
    // Geological Features
    MASSIVE_CANYON: new PlanetFeatureType("Massive Canyon System", "Enormous canyon system visible from orbit", COLORS.Brown),
    IMPACT_BASIN: new PlanetFeatureType("Giant Impact Basin", "Huge ancient impact crater covering large area", COLORS.DarkGray),
    SMOOTH_SURFACE: new PlanetFeatureType("Smooth Surface", "Unusually smooth surface with few craters", COLORS.LightGray),
    
    // Magnetic & Radiation
    STRONG_MAGNETOSPHERE: new PlanetFeatureType("Strong Magnetosphere", "Powerful magnetic field creates spectacular auroras", COLORS.Green),
    RADIATION_BELTS: new PlanetFeatureType("Intense Radiation Belts", "Dangerous radiation zones surround the planet", COLORS.Yellow),
    
    // Unique Features
    TROJAN_ASTEROIDS: new PlanetFeatureType("Trojan Asteroids", "Asteroids trapped in the planet's orbital Lagrange points", COLORS.Gray),
    LARGE_SATELLITE: new PlanetFeatureType("Large Moon", "Exceptionally large natural satellite", COLORS.LightGray),
    BINARY_SYSTEM: new PlanetFeatureType("Binary Planet", "Two similarly-sized bodies orbit each other", COLORS.Cyan),
    ELONGATED_SHAPE: new PlanetFeatureType("Elongated Shape", "Rapid rotation has stretched the planet into an oval", COLORS.White),
    
    // Chemical Composition
    METHANE_ATMOSPHERE: new PlanetFeatureType("Methane Atmosphere", "Atmosphere dominated by methane", COLORS.Orange),
    NITROGEN_ATMOSPHERE: new PlanetFeatureType("Nitrogen Atmosphere", "Thick nitrogen atmosphere", COLORS.Blue),
    WATER_ICE_SURFACE: new PlanetFeatureType("Water Ice Surface", "Surface covered in frozen water", COLORS.White),

    ICE_GEYSERS: new PlanetFeatureType("Ice Geysers", "Cryovolcanic geysers ejecting water ice and vapor", COLORS.LightBlue),
});

const PLANET_FEATURE_TYPES_ALL = Object.values(PLANET_FEATURE_TYPES);
