
/**
 * Represents a type of module that can be installed on ships.
 * @class ShipModuleType
 */
class ShipModuleType {
    /**
     * @param {string} name - The name of the module type.
     * @param {number[]} color - The color associated with this module type.
     * @param {string} description - A description of what the module does.
     * @param {number} value - The base value/price of this module type.
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
 * Represents an instance of a ship module with a quality modifier.
 * @class ShipModule
 */
class ShipModule {
    /**
     * @param {ShipModuleType} moduleType - The type of module.
     * @param {number} quality - The quality multiplier for this module instance.
     */
    constructor(moduleType = new ShipModuleType(), quality = 1) {
        /** @type {ShipModuleType} */
        this.moduleType = moduleType
        /** @type {number} */
        this.quality = quality
    }
}


const SHIP_MODULE_TYPES = {
}

const SHIP_MODULE_TYPES_ALL = Object.values(SHIP_MODULE_TYPES)