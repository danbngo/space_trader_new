// Equipment class
class Equipment {
    /**
     * @param {Planet} planet
     * @param {string} name
     * @param {EquipmentType} equipmentType
     * @param {number} quality
     */
    constructor(planet, name, equipmentType, quality = 1.0) {
        this.planet = planet;
        this.name = name;
        this.equipmentType = equipmentType;
        this.quality = quality;
    }
    get value() {
        // Value is baseValue * quality, rounded
        return Math.round(this.equipmentType.baseValue * this.quality);
    }
}
