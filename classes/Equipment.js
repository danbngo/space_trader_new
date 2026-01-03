/**
 * Represents equipment items that can be bought and sold.
 * @class Equipment
 */
class Equipment {
    /**
     * Creates a new Equipment instance.
     * @param {Planet} planet - The planet where this equipment was manufactured.
     * @param {string} name - The name of the equipment item.
     * @param {EquipmentType} equipmentType - The type of equipment.
     * @param {number} quality - Quality multiplier affecting value (default 1.0).
     */
    constructor(planet, name, equipmentType, quality = 1.0) {
        this.planet = planet;
        this.name = name;
        this.equipmentType = equipmentType;
        this.quality = quality;
    }
    /**
     * Calculates the market value of this equipment.
     * @returns {number} The value in credits (base value * quality, rounded).
     */
    get value() {
        // Value is baseValue * quality, rounded
        return Math.round(this.equipmentType.baseValue * this.quality);
    }
}
