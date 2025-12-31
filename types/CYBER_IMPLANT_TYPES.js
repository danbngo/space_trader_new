/**
 * Represents a type of cybernetic implant that can be installed in officers.
 * @class CyberImplantType
 */
class CyberImplantType {
    /**
     * @param {string} name - The name of the implant type.
     * @param {number[]} color - The color associated with this implant type.
     * @param {string} description - A description of what the implant does.
     * @param {number} value - The base value/price of this implant type.
     */
    constructor(name = '', color = COLORS.White, description = '', value = 0) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description
        /** @type {number} */
        this.value = value
    }
}

/**
 * Represents an instance of a cybernetic implant with a quality modifier.
 * @class CyberImplant
 */
class CyberImplant {
    /**
     * @param {CyberImplantType} implantType - The type of implant.
     * @param {number} quality - The quality multiplier for this implant instance.
     */
    constructor(implantType = new CyberImplantType(), quality = 1) {
        /** @type {CyberImplantType} */
        this.implantType = implantType
        /** @type {number} */
        this.quality = quality
    }

    /**
     * Gets the value of this cyber implant based on its base value and quality.
     * @returns {number} The value in credits.
     */
    get value() {
        return Math.round(this.implantType.value * this.quality)
    }

    get name() {
        return this.implantType.name
    }
}

const CYBER_IMPLANT_TYPES = {
    NEURAL_LINK: new CyberImplantType('Neural Link', COLORS.Cyan, 'Direct brain-computer interface for enhanced cognitive processing', 5000),
    REFLEX_BOOSTER: new CyberImplantType('Reflex Booster', COLORS.Yellow, 'Augmented nervous system for faster reaction times', 4000),
    OCULAR_IMPLANT: new CyberImplantType('Ocular Implant', COLORS.Green, 'Enhanced vision with targeting overlay and threat detection', 3500),
    CARDIO_ENHANCER: new CyberImplantType('Cardio Enhancer', COLORS.Red, 'Synthetic heart augmentation for improved endurance', 3000),
    ADRENALINE_PUMP: new CyberImplantType('Adrenaline Pump', COLORS.Orange, 'Controlled chemical release system for enhanced performance', 4500),
    MEMORY_CORE: new CyberImplantType('Memory Core', COLORS.Purple, 'Digital memory storage for perfect recall and data analysis', 6000),
    TACTICAL_PROCESSOR: new CyberImplantType('Tactical Processor', COLORS.Blue, 'Military-grade combat computer for strategic analysis', 7000),
    SUBDERMAL_ARMOR: new CyberImplantType('Subdermal Armor', COLORS.Gray, 'Reinforced skeletal structure and armored skin layers', 5500),
    COMM_IMPLANT: new CyberImplantType('Comm Implant', COLORS.LightBlue, 'Integrated communication system for instant networking', 2500),
    PAIN_EDITOR: new CyberImplantType('Pain Editor', COLORS.DarkGray, 'Neural regulator that suppresses pain signals', 4000),
    BIOMONITOR: new CyberImplantType('Biomonitor', COLORS.LightGreen, 'Health monitoring system with auto-medication', 3000),
    SKILL_CHIP: new CyberImplantType('Skill Chip', COLORS.Magenta, 'Downloadable expertise in various technical skills', 8000),
    CHARISMA_ENHANCER: new CyberImplantType('Charisma Enhancer', COLORS.Pink, 'Pheromone regulators and micro-expression control', 3500),
    CYBER_ARM: new CyberImplantType('Cyber Arm', COLORS.Silver, 'Full arm replacement with enhanced strength and dexterity', 6500),
    SYNTHETIC_LUNG: new CyberImplantType('Synthetic Lung', COLORS.LightCyan, 'Artificial respiratory system tolerant to toxins', 4500),
}

const CYBER_IMPLANT_TYPES_ALL = Object.values(CYBER_IMPLANT_TYPES)
