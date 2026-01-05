/**
 * Represents a type of cargo that can be traded.
 * @class CargoType
 */
class CargoType {
    /**
     * @param {string} name - The name of the cargo type.
     * @param {string} symbol - The symbol/emoji representing this cargo type.
     * @param {number[]} color - The color associated with this cargo type.
     * @param {number} value - The base value/price of this cargo type.
     * @param {boolean} illegal - Whether this cargo is illegal (black market only).
     * @param {string} description - A brief description of this cargo type.
     */
    constructor(name = '', symbol = '📦', color = COLORS.White, value = 1, illegal = false, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.symbol = symbol
        /** @type {number[]} */
        this.color = color;
        /** @type {number} */
        this.value = value
        /** @type {boolean} */
        this.illegal = illegal
        /** @type {string} */
        this.description = description
    }
}

const CARGO_TYPES = {
    FOOD: new CargoType('Food', '🍎', COLORS.Green, 50, false, 
        'Essential sustenance for any civilization, from preserved rations to fresh produce. Planets with fertile soil, water oceans, and breathable atmospheres produce the most abundant supplies.'),
    METAL: new CargoType('Metal', '⚙️', COLORS.LightGray, 100, false, 
        'Refined ore and alloys used in construction, manufacturing, and shipbuilding. Industrial worlds with metallic geology or iron-rich composition extract the highest yields.'),
    WATER: new CargoType('Water', '💧', COLORS.LightBlue, 200, false, 
        'The universal solvent and foundation of life, critical for survival and industrial processes. Planets with liquid oceans or ice deposits can easily supply water, while arid worlds must import at premium prices.'),
    ISOTOPES: new CargoType('Isotopes', '☢️', COLORS.LightYellow, 400, false, 
        'Radioactive elements used in power generation, medical treatments, and scientific research. Gas giants with hydrogen-helium atmospheres and high-tech civilizations are the primary sources.'),
    NANITES: new CargoType('Nanites', '🔬', COLORS.Gray, 200, false, 
        'Microscopic machines capable of molecular-level assembly and repair. Only advanced civilizations with sophisticated technology and industry can manufacture these precision instruments.'),
    MEDICINE: new CargoType('Medicine', '💊', COLORS.Blue, 400, false, 
        'Pharmaceutical compounds and medical supplies for treating disease and injury. Wealthy, educated worlds with advanced technology produce the most effective treatments.'),
    HOLOCUBES: new CargoType('Holocubes', '🎬', COLORS.Yellow, 800, false, 
        'Entertainment media containing immersive holographic experiences, from films to games. Cultural centers and prosperous economies create the most sought-after content.'),
    WEAPONS: new CargoType('Weapons', '🔫', COLORS.Red, 400, true, 
        'Illegal military-grade armaments prohibited by interplanetary law. Black markets in lawless systems with high crime and low security traffic these dangerous goods.'),
    DRUGS: new CargoType('Drugs', '💉', COLORS.Orange, 1600, true, 
        'Illegal narcotics and controlled substances banned across civilized space. Criminal networks thrive in corrupt systems with poor education and weak law enforcement.'),
    ANTIMATTER: new CargoType('Antimatter', '⚡', COLORS.Purple, 800, true, 
        'Highly restricted exotic matter used in advanced military applications and theoretical weapons. Only powerful naval forces with cutting-edge technology can safely produce and contain it.'),
    RELICS: new CargoType('Relics', '🏺', COLORS.Brown, 2000, false, 
        'Ancient artifacts from lost civilizations, priceless to collectors and historians. These treasures are discovered in ruins and cannot be manufactured or traded in normal markets.'),
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)
