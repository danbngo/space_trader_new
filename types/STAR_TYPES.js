/**
 * @fileoverview Defines star type classifications with mass and radius ranges.
 * @module types/STAR_TYPES
 */

/**
 * @class StarType
 * @classdesc Represents a classification of star with physical characteristics.
 * @property {string} name - The name of the star type.
 * @property {string} spectralClass - The spectral classification (O, B, A, F, G, K, M, etc.).
 * @property {number[]} color - The color of the star (RGBA array).
 * @property {number} minMass - Minimum mass in solar masses.
 * @property {number} maxMass - Maximum mass in solar masses.
 * @property {number} minRadius - Minimum radius in solar radii.
 * @property {number} maxRadius - Maximum radius in solar radii.
 * @property {number} minTemp - Minimum surface temperature in Kelvin.
 * @property {number} maxTemp - Maximum surface temperature in Kelvin.
 * @property {number} weight - Relative frequency weight for generation.
 */
class StarType {
    /**
     * @param {string} name - The name of the star type.
     * @param {string} spectralClass - The spectral classification.
     * @param {number[]} color - The color of the star (RGBA array).
     * @param {number} minMass - Minimum mass in solar masses.
     * @param {number} maxMass - Maximum mass in solar masses.
     * @param {number} minRadius - Minimum radius in solar radii.
     * @param {number} maxRadius - Maximum radius in solar radii.
     * @param {number} minTemp - Minimum temperature in Kelvin.
     * @param {number} maxTemp - Maximum temperature in Kelvin.
     * @param {number} weight - Relative frequency weight for generation.
     */
    constructor(name, spectralClass, color, minMass, maxMass, minRadius, maxRadius, minTemp, maxTemp, weight = 1.0) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.spectralClass = spectralClass
        /** @type {number[]} */
        this.color = color
        /** @type {number} */
        this.minMass = minMass
        /** @type {number} */
        this.maxMass = maxMass
        /** @type {number} */
        this.minRadius = minRadius
        /** @type {number} */
        this.maxRadius = maxRadius
        /** @type {number} */
        this.minTemp = minTemp
        /** @type {number} */
        this.maxTemp = maxTemp
        /** @type {number} */
        this.weight = weight
    }
}

// Main Sequence Stars (by spectral class)
const STAR_TYPES = Object.freeze({
    // Main Sequence Stars
    O_TYPE: new StarType("O-Type Star", "O", COLORS.LightBlue, 16, 90, 6.6, 15, 30000, 50000, 0.00003),
    B_TYPE: new StarType("B-Type Star", "B", COLORS.Blue, 2.1, 16, 1.8, 6.6, 10000, 30000, 0.13),
    A_TYPE: new StarType("A-Type Star", "A", COLORS.White, 1.4, 2.1, 1.4, 1.8, 7500, 10000, 0.6),
    F_TYPE: new StarType("F-Type Star", "F", COLORS.LightYellow, 1.04, 1.4, 1.15, 1.4, 6000, 7500, 3),
    G_TYPE: new StarType("G-Type Star", "G", COLORS.Yellow, 0.8, 1.04, 0.96, 1.15, 5200, 6000, 7.6),
    K_TYPE: new StarType("K-Type Star", "K", COLORS.Orange, 0.45, 0.8, 0.7, 0.96, 3700, 5200, 12.1),
    M_TYPE: new StarType("M-Type Star", "M", COLORS.Red, 0.08, 0.45, 0.4, 0.7, 2400, 3700, 76.45),
    
    // Red Dwarfs (smallest M-types)
    RED_DWARF: new StarType("Red Dwarf", "M", COLORS.DarkRed, 0.08, 0.3, 0.1, 0.4, 2300, 3500, 0.15),
    
    // Brown Dwarfs (sub-stellar)
    BROWN_DWARF: new StarType("Brown Dwarf", "L/T", COLORS.Brown, 0.01, 0.08, 0.08, 0.15, 500, 2300),
    
    // Evolved Stars
    RED_GIANT: new StarType("Red Giant", "K/M III", COLORS.Red, 0.3, 8, 15, 100, 3000, 5000),
    RED_SUPERGIANT: new StarType("Red Supergiant", "M I", COLORS.DarkRed, 10, 40, 200, 1000, 3000, 4500),
    BLUE_GIANT: new StarType("Blue Giant", "O/B III", COLORS.LightBlue, 10, 20, 10, 30, 10000, 33000),
    BLUE_SUPERGIANT: new StarType("Blue Supergiant", "O/B I", COLORS.Blue, 20, 60, 20, 50, 10000, 50000),
    
    // White Dwarfs
    WHITE_DWARF: new StarType("White Dwarf", "D", COLORS.White, 0.17, 1.33, 0.008, 0.02, 8000, 40000),
    BLACK_DWARF: new StarType("Black Dwarf", "D", COLORS.Gray, 0.17, 1.33, 0.008, 0.02, 0, 3000),
    
    // Neutron Stars
    NEUTRON_STAR: new StarType("Neutron Star", "NS", COLORS.LightCyan, 1.1, 2.3, 0.00001, 0.00003, 100000, 1000000),
    PULSAR: new StarType("Pulsar", "PSR", COLORS.Cyan, 1.1, 2.3, 0.00001, 0.00003, 100000, 1000000),
    MAGNETAR: new StarType("Magnetar", "SGR", COLORS.Purple, 1.4, 2.3, 0.00001, 0.00003, 100000, 1000000),
    
    // Black Holes
    STELLAR_BLACK_HOLE: new StarType("Stellar Black Hole", "BH", COLORS.Black, 3, 20, 0.000001, 0.00001, 0, 0),
    SUPERMASSIVE_BLACK_HOLE: new StarType("Supermassive Black Hole", "SMBH", COLORS.DarkPurple, 100000, 10000000, 0.001, 0.1, 0, 0),
})

const STAR_TYPES_ALL = Object.values(STAR_TYPES)

// Main sequence stars only (for normal star generation)
const MAIN_SEQUENCE_STAR_TYPES = [
    STAR_TYPES.O_TYPE,
    STAR_TYPES.B_TYPE,
    STAR_TYPES.A_TYPE,
    STAR_TYPES.F_TYPE,
    STAR_TYPES.G_TYPE,
    STAR_TYPES.K_TYPE,
    STAR_TYPES.M_TYPE,
    STAR_TYPES.RED_DWARF,
]

// Exotic stars for special generation
const EXOTIC_STAR_TYPES = [
    STAR_TYPES.BROWN_DWARF,
    STAR_TYPES.RED_GIANT,
    STAR_TYPES.RED_SUPERGIANT,
    STAR_TYPES.BLUE_GIANT,
    STAR_TYPES.BLUE_SUPERGIANT,
    STAR_TYPES.WHITE_DWARF,
    STAR_TYPES.BLACK_DWARF,
    STAR_TYPES.NEUTRON_STAR,
    STAR_TYPES.PULSAR,
    STAR_TYPES.MAGNETAR,
    STAR_TYPES.STELLAR_BLACK_HOLE,
]
