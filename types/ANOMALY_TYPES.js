/**
 * @class AnomalyType
 * @classdesc Represents a type of space anomaly with specific characteristics.
 * @property {string} name - The name of the anomaly type.
 * @property {number[]} color - The color for this anomaly type (RGBA array).
 * @property {string} description - Description of the anomaly.
 */
class AnomalyType {
    /**
     * @param {string} name - The name of the anomaly type.
     * @param {number[]} color - The color for this anomaly type (RGBA array).
     * @param {string} description - Description of the anomaly.
     */
    constructor(name, color, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.description = description
    }
}

const ANOMALY_TYPES = Object.freeze({
    QUANTUM_FLUCTUATION: new AnomalyType("Quantum Fluctuation", COLORS.Purple, "A localized distortion in spacetime fabric"),
    DARK_MATTER_CLOUD: new AnomalyType("Dark Matter Cloud", COLORS.DarkGray, "A dense concentration of mysterious dark matter"),
    TEMPORAL_RIFT: new AnomalyType("Temporal Rift", COLORS.DarkCyan, "A tear in the fabric of space-time"),
    EXOTIC_PARTICLES: new AnomalyType("Exotic Particles", COLORS.Green, "Unusual subatomic particles not found elsewhere"),
    GRAVITATIONAL_WAVE: new AnomalyType("Gravitational Wave", COLORS.Blue, "Ripples in spacetime from distant cosmic events"),
    ENERGY_VORTEX: new AnomalyType("Energy Vortex", COLORS.Red, "A swirling concentration of pure energy"),
    SUBSPACE_ANOMALY: new AnomalyType("Subspace Anomaly", COLORS.Magenta, "An irregularity in the underlying structure of space"),
});

const ANOMALY_TYPES_ALL = Object.values(ANOMALY_TYPES);
