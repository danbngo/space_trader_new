/**
 * Represents a type of genetic modification that can be applied to officers.
 * @class GeneticModificationType
 */
class GeneticModificationType {
    /**
     * @param {string} name - The name of the genetic modification type.
     * @param {number[]} color - The color associated with this modification type.
     * @param {string} description - A description of what the modification does.
     * @param {number} value - The base value/price of this modification type.
     * @param {string} symbol - The symbol representing this modification type.
     */
    constructor(name = '', color = COLORS.White, description = '', value = 0, symbol = '🧬') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description
        /** @type {number} */
        this.value = value
        /** @type {string} */
        this.symbol = symbol
    }
}

/**
 * Represents an instance of a genetic modification with a quality modifier.
 * @class GeneticModification
 */
class GeneticModification {
    /**
     * @param {GeneticModificationType} modificationType - The type of genetic modification.
     * @param {number} quality - The quality multiplier for this modification instance.
     */
    constructor(modificationType = new GeneticModificationType(), quality = 1) {
        /** @type {GeneticModificationType} */
        this.modificationType = modificationType
        /** @type {number} */
        this.quality = quality
    }

    /**
     * Gets the value of this genetic modification based on its base value and quality.
     * @returns {number} The value in credits.
     */
    get value() {
        return Math.round(this.modificationType.value * this.quality)
    }

    get name() {
        return this.modificationType.name
    }
}

const GENETIC_MODIFICATION_TYPES = {
    ENHANCED_METABOLISM: new GeneticModificationType('Enhanced Metabolism', COLORS.LightGreen, 'Optimized cellular energy production for increased stamina and recovery', 6000, '⚡'),
    MUSCLE_AUGMENTATION: new GeneticModificationType('Muscle Augmentation', COLORS.Red, 'Increased muscle density and fiber optimization for superior strength', 5500, '💪'),
    NEURAL_PLASTICITY: new GeneticModificationType('Neural Plasticity', COLORS.Purple, 'Enhanced synaptic connections for accelerated learning and memory', 7000, '🧠'),
    LONGEVITY_TREATMENT: new GeneticModificationType('Longevity Treatment', COLORS.Gold, 'Telomere extension and cellular rejuvenation for extended lifespan', 9000, '⏳'),
    IMMUNE_ENHANCEMENT: new GeneticModificationType('Immune Enhancement', COLORS.Blue, 'Supercharged immune system resistant to diseases and toxins', 5000, '🛡'),
    SENSORY_AMPLIFICATION: new GeneticModificationType('Sensory Amplification', COLORS.Yellow, 'Heightened sensory perception across all five senses', 4500, '👁'),
    ADRENALINE_REGULATION: new GeneticModificationType('Adrenaline Regulation', COLORS.Orange, 'Controlled stress response for peak performance under pressure', 5500, '🔥'),
    BONE_DENSITY_BOOST: new GeneticModificationType('Bone Density Boost', COLORS.Gray, 'Reinforced skeletal structure for durability and impact resistance', 4000, '🦴'),
    OXYGEN_EFFICIENCY: new GeneticModificationType('Oxygen Efficiency', COLORS.LightBlue, 'Enhanced hemoglobin for superior oxygen transport and endurance', 4500, '💨'),
    COGNITIVE_ACCELERATOR: new GeneticModificationType('Cognitive Accelerator', COLORS.Cyan, 'Increased processing speed and parallel thought capabilities', 7500, '⚡'),
    PAIN_RESISTANCE: new GeneticModificationType('Pain Resistance', COLORS.DarkGray, 'Reduced pain receptor sensitivity while maintaining awareness', 4000, '🔇'),
    THERMAL_ADAPTATION: new GeneticModificationType('Thermal Adaptation', COLORS.Red, 'Enhanced temperature regulation for extreme environment survival', 3500, '🌡'),
    REGENERATION: new GeneticModificationType('Regeneration', COLORS.Green, 'Accelerated cellular regeneration for rapid healing', 8000, '❤'),
    RADIATION_RESISTANCE: new GeneticModificationType('Radiation Resistance', COLORS.Yellow, 'DNA repair mechanisms against harmful radiation', 6000, '☢'),
    NEURAL_COORDINATION: new GeneticModificationType('Neural Coordination', COLORS.Magenta, 'Enhanced hand-eye coordination and reflexes', 5000, '🎯'),
}

const GENETIC_MODIFICATION_TYPES_ALL = Object.values(GENETIC_MODIFICATION_TYPES)
