/**
 * @fileoverview Defines unique features and characteristics that stars can possess.
 * @module types/STAR_FEATURES
 */

/**
 * @class StarFeatureType
 * @classdesc Represents a unique feature or characteristic of a star.
 * @property {string} name - The name of the feature.
 * @property {string} description - A description of the feature.
 * @property {number[]} color - The color associated with this feature (RGBA array).
 */
class StarFeatureType {
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

const STAR_FEATURE_TYPES = Object.freeze({
    // Binary/Multiple Systems
    BINARY_COMPANION: new StarFeatureType("Binary System", "This star has a stellar companion, orbiting in a gravitational dance", COLORS.Yellow),
    TRINARY_SYSTEM: new StarFeatureType("Trinary System", "Three stars orbit their common center of mass", COLORS.Orange),
    ECLIPSING_BINARY: new StarFeatureType("Eclipsing Binary", "Binary stars that periodically eclipse each other from our viewpoint", COLORS.Purple),
    
    // Variable Stars
    CEPHEID_VARIABLE: new StarFeatureType("Cepheid Variable", "Star pulsates with regular period, changing brightness predictably", COLORS.Yellow),
    IRREGULAR_VARIABLE: new StarFeatureType("Irregular Variable", "Brightness varies unpredictably over time", COLORS.Orange),
    FLARE_STAR: new StarFeatureType("Flare Star", "Prone to sudden, dramatic increases in brightness from stellar flares", COLORS.Red),
    
    // Magnetic & Activity
    INTENSE_MAGNETIC_FIELD: new StarFeatureType("Intense Magnetic Field", "Extremely powerful magnetic field affects nearby space", COLORS.Magenta),
    STELLAR_SPOTS: new StarFeatureType("Massive Starspots", "Enormous dark regions cover significant portions of surface", COLORS.DarkRed),
    CORONAL_MASS_EJECTIONS: new StarFeatureType("Frequent CMEs", "Regularly ejects massive amounts of stellar material", COLORS.Orange),
    SOLAR_WIND: new StarFeatureType("Powerful Stellar Wind", "Emits exceptionally strong stellar wind", COLORS.LightBlue),
    
    // Rotation & Structure
    RAPID_ROTATION: new StarFeatureType("Rapid Rotation", "Spins extremely fast, causing equatorial bulge", COLORS.Cyan),
    DIFFERENTIAL_ROTATION: new StarFeatureType("Differential Rotation", "Different latitudes rotate at different speeds", COLORS.Blue),
    
    // Exotic Phenomena
    JETS: new StarFeatureType("Polar Jets", "Shoots massive jets of material from magnetic poles", COLORS.Cyan),
    ACCRETION_DISK: new StarFeatureType("Accretion Disk", "Surrounded by disk of infalling matter", COLORS.Orange),
    NOVA_REMNANT: new StarFeatureType("Nova Remnant", "Expelled shell of material from past nova explosion", COLORS.LightGreen),
    PLANETARY_NEBULA: new StarFeatureType("Planetary Nebula", "Surrounded by glowing shells of ejected gas", COLORS.Green),
    
    // Composition Anomalies
    METAL_RICH: new StarFeatureType("Metal-Rich", "Unusually high concentration of heavy elements", COLORS.Yellow),
    METAL_POOR: new StarFeatureType("Metal-Poor", "Extremely low metallicity, possibly primordial star", COLORS.White),
    CARBON_STAR: new StarFeatureType("Carbon Star", "Atmosphere dominated by carbon compounds", COLORS.Red),
    TECHNETIUM_STAR: new StarFeatureType("Technetium Star", "Contains radioactive technetium in its spectrum", COLORS.Green),
    
    // Exotic Objects
    PULSAR_BEAM: new StarFeatureType("Pulsar Beam", "Emits focused beam of radiation from magnetic poles", COLORS.Cyan),
    X_RAY_BINARY: new StarFeatureType("X-Ray Binary", "Emits intense X-rays from accretion onto compact companion", COLORS.Purple),
    GAMMA_RAY_BURSTER: new StarFeatureType("Gamma Ray Source", "Periodically emits dangerous gamma ray bursts", COLORS.Magenta),
    
    // Gravitational
    GRAVITATIONAL_LENSING: new StarFeatureType("Gravitational Lens", "Mass bends light from background objects", COLORS.Blue),
    HAWKING_RADIATION: new StarFeatureType("Hawking Radiation", "Black hole emits faint radiation from event horizon", COLORS.Purple),
    ERGOSPHERE: new StarFeatureType("Ergosphere", "Rotating black hole drags spacetime around it", COLORS.DarkPurple),
    
    // Stellar Wind & Nebulae
    WOLF_RAYET: new StarFeatureType("Wolf-Rayet Phase", "Shedding outer layers in powerful stellar wind", COLORS.Blue),
    CIRCUMSTELLAR_DISK: new StarFeatureType("Circumstellar Disk", "Dense disk of gas and dust surrounds the star", COLORS.Brown),
    BOW_SHOCK: new StarFeatureType("Bow Shock", "Creates shock wave as it moves through interstellar medium", COLORS.Red),
    
    // Age & Evolution
    PROTO_STAR: new StarFeatureType("Proto-Star", "Still forming, surrounded by collapsing gas cloud", COLORS.Brown),
    PRE_SUPERNOVA: new StarFeatureType("Pre-Supernova", "Nearing end of life, unstable and highly luminous", COLORS.Red),
    SUPERNOVA_PROGENITOR: new StarFeatureType("Supernova Candidate", "Star likely to explode as supernova soon", COLORS.Orange),
    
    // Rare & Unique
    ZOMBIE_STAR: new StarFeatureType("Zombie Star", "Survived supernova explosion, now stripped to core", COLORS.Gray),
    THORNE_ZYTKOW_OBJECT: new StarFeatureType("Thorne-Żytkow Object", "Red giant with neutron star at its core", COLORS.Red),
    QUASI_STAR: new StarFeatureType("Quasi-Star", "Black hole feeding on star from within", COLORS.DarkPurple),
    BLUE_STRAGGLER: new StarFeatureType("Blue Straggler", "Appears younger than it should be", COLORS.LightBlue),
    
    // System Features
    DEBRIS_DISK: new StarFeatureType("Debris Disk", "Ring of rocky debris orbits the star", COLORS.Gray),
    ASTEROID_BELT: new StarFeatureType("Dense Asteroid Belt", "Unusually dense asteroid belt orbits star", COLORS.Brown),
    KUIPER_BELT: new StarFeatureType("Extensive Kuiper Belt", "Vast belt of icy bodies in outer system", COLORS.LightBlue),
    OORT_CLOUD: new StarFeatureType("Dense Oort Cloud", "Thick spherical shell of comets surrounds system", COLORS.White),
})

const STAR_FEATURE_TYPES_ALL = Object.values(STAR_FEATURE_TYPES)
