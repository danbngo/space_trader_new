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
     */
    constructor(name = '', symbol = '📦', color = COLORS.White, value = 1, illegal = false) {
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
    }
}

const CARGO_TYPES = {
    FOOD: new CargoType('Food', '🍎', COLORS.Green, 50, false), //basic survival
    METAL: new CargoType('Metal', '⚙️', COLORS.LightGray, 100, false), //industry
    WATER: new CargoType('Water', '💧', COLORS.LightBlue, 200, false), //raw survival, famine, etc.
    ISOTOPES: new CargoType('Isotopes', '☢️', COLORS.LightYellow, 400, false), //science, technological development
    NANITES: new CargoType('Nanites', '🔬', COLORS.Gray, 200, false), //construction
    MEDICINE: new CargoType('Medicine', '💊', COLORS.Blue, 400, false), //plagues, wars, etc.
    HOLOCUBES: new CargoType('Holocubes', '🎬', COLORS.Yellow, 800, false), //entertainment
    WEAPONS: new CargoType('Weapons', '🔫', COLORS.Red, 400, true), //civil war, conflict
    DRUGS: new CargoType('Drugs', '💉', COLORS.Orange, 1600, true), //crime
    ANTIMATTER: new CargoType('Antimatter', '⚡', COLORS.Purple, 800, true), //military
    RELICS: new CargoType('Relics', '🏺', COLORS.Brown, 2000, false), //ancient artifacts, not sold in markets
}
const CARGO_TYPES_ALL = Object.values(CARGO_TYPES)
