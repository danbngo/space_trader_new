// EquipmentSlot class and EQUIPMENT_SLOTS definition
class EquipmentSlot {
    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

const EQUIPMENT_SLOTS = Object.freeze({
    HEAD: new EquipmentSlot('head', 'Head'),
    ARMOR: new EquipmentSlot('armor', 'Armor'),
    TOOL: new EquipmentSlot('tool', 'Tool'),
    WEAPON: new EquipmentSlot('weapon', 'Weapon'),
});

const EQUIPMENT_SLOTS_ALL = Object.values(EQUIPMENT_SLOTS);
