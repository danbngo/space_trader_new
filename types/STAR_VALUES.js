/**
 * @fileoverview Defines stellar characteristics (metallicity, age, luminosity) similar to climate values.
 * @module types/STAR_VALUES
 */

/**
 * @class StarValue
 * @classdesc Base class for star-related values with scoring.
 * @property {string} name - The name of the value.
 * @property {number} value - The numeric value.
 * @property {number} solValue - Sol's (Sun's) value for this characteristic.
 * @property {number} score - The score calculated from the value.
 * @property {string} coloredName - The name wrapped in a colored span based on the score.
 */
class StarValue {
    constructor(name, value, solValue) {
        this.name = name
        this.value = value
        this.solValue = solValue
        this.score = StarValue.scoreStarValue(value/solValue)
        this.coloredName = statColorSpan(this.name, this.score)
    }
    
    static scoreStarValue(value = 1.0) {
        // Similar scoring to ClimateValue - deviations from 1.0 are penalized
        // 1.0 = perfect (Sol-like) score of 4.0
        if (value <= 0) return 0
        
        // Use logarithmic distance from 1.0
        const logDistance = Math.abs(Math.log2(value))
        
        // Use 4th power for steep punishment curve
        // score = 2^(-4*logDistance) * 4
        const score = Math.pow(2, -4*logDistance) * 4
        
        return score
    }
}

/**
 * @class StarMetallicity
 * @extends StarValue
 * @classdesc Represents the metallicity (heavy element content) of a star.
 */
class StarMetallicity extends StarValue {
    constructor(name, value, solValue, weight = 1.0) {
        super(name, value, solValue)
        this.weight = weight
    }
}

/**
 * @class StarAge
 * @extends StarValue
 * @classdesc Represents the age of a star.
 */
class StarAge extends StarValue {}

/**
 * @class StarLuminosity
 * @extends StarValue
 * @classdesc Represents the luminosity of a star.
 */
class StarLuminosity extends StarValue {}

// Metallicity Levels (Z/Z_sol where Z_sol = 0.0134 mass fraction)
const STAR_METALLICITY_LEVELS = Object.freeze({
    ULTRA_POOR: new StarMetallicity("Ultra Metal-Poor", 0.001, 1, 0.05),      // 0.001x solar
    EXTREMELY_POOR: new StarMetallicity("Extremely Metal-Poor", 0.01, 1, 0.10), // 0.01x solar
    VERY_POOR: new StarMetallicity("Very Metal-Poor", 0.1, 1, 0.10),          // 0.1x solar
    POOR: new StarMetallicity("Metal-Poor", 0.5, 1, 0.10),                    // 0.5x solar
    SLIGHTLY_POOR: new StarMetallicity("Slightly Metal-Poor", 0.75, 1, 0.15), // 0.75x solar
    SOLAR: new StarMetallicity("Solar Metallicity", 1.0, 1, 0.20),            // 1.0x solar (Sol)
    SLIGHTLY_RICH: new StarMetallicity("Slightly Metal-Rich", 1.33, 1, 0.15), // 1.33x solar
    RICH: new StarMetallicity("Metal-Rich", 2.0, 1, 0.10),                    // 2x solar
    VERY_RICH: new StarMetallicity("Very Metal-Rich", 3.0, 1, 0.10),          // 3x solar
    EXTREMELY_RICH: new StarMetallicity("Extremely Metal-Rich", 5.0, 1, 0.05), // 5x solar
})

const STAR_METALLICITY_LEVELS_ALL = Object.values(STAR_METALLICITY_LEVELS)

// Age Levels (in billions of years, Sol is ~4.6 billion years old)
const STAR_AGE_LEVELS = Object.freeze({
    PROTO_STAR: new StarAge("Proto-Star", 0.001, 4.6),           // <1 million years
    INFANT: new StarAge("Infant Star", 0.01, 4.6),               // ~10 million years
    YOUNG: new StarAge("Young Star", 0.5, 4.6),                  // ~500 million years
    JUVENILE: new StarAge("Juvenile Star", 1.5, 4.6),            // ~1.5 billion years
    MATURE: new StarAge("Mature Star", 3.0, 4.6),                // ~3 billion years
    SOLAR_AGE: new StarAge("Solar-Age Star", 4.6, 4.6),          // ~4.6 billion years (Sol)
    MIDDLE_AGED: new StarAge("Middle-Aged Star", 6.0, 4.6),      // ~6 billion years
    OLD: new StarAge("Old Star", 8.0, 4.6),                      // ~8 billion years
    ANCIENT: new StarAge("Ancient Star", 10.0, 4.6),             // ~10 billion years
    PRIMORDIAL: new StarAge("Primordial Star", 13.0, 4.6),       // ~13 billion years
})

const STAR_AGE_LEVELS_ALL = Object.values(STAR_AGE_LEVELS)

// Luminosity Levels (in solar luminosities, Sol = 1.0 L_sol)
const STAR_LUMINOSITY_LEVELS = Object.freeze({
    DIM: new StarLuminosity("Dim", 0.001, 1),                    // 0.001x solar
    FAINT: new StarLuminosity("Faint", 0.01, 1),                 // 0.01x solar
    SUBDUED: new StarLuminosity("Subdued", 0.1, 1),              // 0.1x solar
    LOW: new StarLuminosity("Low Luminosity", 0.5, 1),           // 0.5x solar
    MODERATE: new StarLuminosity("Moderate Luminosity", 0.8, 1), // 0.8x solar
    SOLAR: new StarLuminosity("Solar Luminosity", 1.0, 1),       // 1.0x solar (Sol)
    BRIGHT: new StarLuminosity("Bright", 1.5, 1),                // 1.5x solar
    VERY_BRIGHT: new StarLuminosity("Very Bright", 3.0, 1),      // 3x solar
    BRILLIANT: new StarLuminosity("Brilliant", 10.0, 1),         // 10x solar
    INTENSELY_LUMINOUS: new StarLuminosity("Intensely Luminous", 100, 1), // 100x solar
    HYPERLUMINOUS: new StarLuminosity("Hyperluminous", 1000, 1), // 1000x solar
    ULTRALUMINOUS: new StarLuminosity("Ultraluminous", 10000, 1), // 10,000x solar
})

const STAR_LUMINOSITY_LEVELS_ALL = Object.values(STAR_LUMINOSITY_LEVELS)
