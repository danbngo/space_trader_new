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
    
    // Axial Properties
    TIDALLY_LOCKED: new PlanetFeatureType("Tidally Locked", "One face always points toward its star", COLORS.Orange),
    
    // Temperature Extremes
    EXTREMELY_HOT: new PlanetFeatureType("Extremely Hot", "Surface temperatures reach extreme highs", COLORS.Red),
    EXTREMELY_COLD: new PlanetFeatureType("Extremely Cold", "Surface temperatures are frigid and frozen", COLORS.LightBlue),
    
    // Atmospheric Features
    THICK_ATMOSPHERE: new PlanetFeatureType("Thick Atmosphere", "Dense atmospheric layer surrounds the planet", COLORS.White),
    THIN_ATMOSPHERE: new PlanetFeatureType("Thin Atmosphere", "Very thin, barely present atmosphere", COLORS.LightGray),
    NO_ATMOSPHERE: new PlanetFeatureType("No Atmosphere", "Complete lack of atmospheric protection", COLORS.Gray),
    GREAT_STORM: new PlanetFeatureType("Great Storm", "Massive perpetual storm system visible from space", COLORS.Red),
    DENSE_CLOUDS: new PlanetFeatureType("Dense Cloud Cover", "Thick cloud layers obscure the surface", COLORS.White),
    GREENHOUSE_EFFECT: new PlanetFeatureType("Runaway Greenhouse", "Extreme greenhouse effect creates hellish temperatures", COLORS.Orange),
    
    // Oceans
    OCEAN_WORLD: new PlanetFeatureType("Ocean World", "Surface covered largely by liquid oceans", COLORS.Blue),
    DRY_WORLD: new PlanetFeatureType("Dry World", "Little to no surface water present", COLORS.Brown),
    
    // Surface Features
    VOLCANIC_ACTIVITY: new PlanetFeatureType("Active Volcanism", "Intense volcanic activity reshapes the surface", COLORS.DarkRed),
    ICE_CAPS: new PlanetFeatureType("Polar Ice Caps", "Frozen water at the planet's poles", COLORS.White),
    CRYOVOLCANISM: new PlanetFeatureType("Cryovolcanism", "Volcanoes that erupt ice and frozen gases", COLORS.LightBlue),
    SUBSURFACE_OCEAN: new PlanetFeatureType("Subsurface Ocean", "Liquid ocean hidden beneath ice shell", COLORS.DarkBlue),
    
    // Magnetic & Radiation
    STRONG_MAGNETOSPHERE: new PlanetFeatureType("Strong Magnetosphere", "Powerful magnetic field creates spectacular auroras", COLORS.Green),
    WEAK_MAGNETOSPHERE: new PlanetFeatureType("Weak Magnetosphere", "Minimal magnetic field protection", COLORS.LightGreen),
    NO_MAGNETOSPHERE: new PlanetFeatureType("No Magnetosphere", "No magnetic field protection", COLORS.Gray),
    RADIATION_BELTS: new PlanetFeatureType("Intense Radiation Belts", "Dangerous radiation zones surround the planet", COLORS.Yellow),
    HIGH_RADIATION: new PlanetFeatureType("High Radiation", "Elevated radiation levels from nearby sources", COLORS.Orange),
    
    // Gravity
    LOW_GRAVITY: new PlanetFeatureType("Low Gravity", "Significantly lower than Earth gravity", COLORS.LightGray),
    HIGH_GRAVITY: new PlanetFeatureType("High Gravity", "Significantly higher than Earth gravity", COLORS.DarkGray),
    
    // Pollution
    HEAVY_POLLUTION: new PlanetFeatureType("Heavy Pollution", "Severe environmental contamination", COLORS.DarkGreen),
    
    WATER_ICE_SURFACE: new PlanetFeatureType("Water Ice Surface", "Surface covered in frozen water", COLORS.White),
    ICE_GEYSERS: new PlanetFeatureType("Ice Geysers", "Cryovolcanic geysers ejecting water ice and vapor", COLORS.LightBlue),
});

const PLANET_FEATURE_TYPES_ALL = Object.values(PLANET_FEATURE_TYPES);
