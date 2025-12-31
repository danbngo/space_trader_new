// EquipmentType class and EQUIPMENT_TYPES definition
class EquipmentType {
    /**
     * @param {string} id
     * @param {string} name
     * @param {EquipmentSlot} slot
     * @param {string} description
     * @param {number} baseValue
     */
    constructor(id, name, slot, description, baseValue = 100) {
        this.id = id;
        this.name = name;
        this.slot = slot;
        this.description = description;
        this.baseValue = baseValue;
    }
}

// Import slots
// ...existing code...

const EQUIPMENT_TYPES = Object.freeze({
    // Head
    HELMET: new EquipmentType('helmet', 'Combat Helmet', EQUIPMENT_SLOTS.HEAD, 'Protects the head from injury.', 200),
    VISOR: new EquipmentType('visor', 'Tactical Visor', EQUIPMENT_SLOTS.HEAD, 'Enhanced vision and HUD.', 300),
    // Armor
    LIGHT_ARMOR: new EquipmentType('light_armor', 'Light Armor', EQUIPMENT_SLOTS.ARMOR, 'Flexible, basic protection.', 400),
    HEAVY_ARMOR: new EquipmentType('heavy_armor', 'Heavy Armor', EQUIPMENT_SLOTS.ARMOR, 'Bulky, high protection.', 800),
    // Tools
    REPAIR_TOOL: new EquipmentType('repair_tool', 'Repair Tool', EQUIPMENT_SLOTS.TOOL, 'Used for ship and equipment repairs.', 250),
    SCANNER: new EquipmentType('scanner', 'Scanner', EQUIPMENT_SLOTS.TOOL, 'Detects hidden objects and hazards.', 350),
    HACKING_DEVICE: new EquipmentType('hacking_device', 'Hacking Device', EQUIPMENT_SLOTS.TOOL, 'Bypasses security systems.', 500),
    MEDKIT: new EquipmentType('medkit', 'Medkit', EQUIPMENT_SLOTS.TOOL, 'Heals injuries and treats wounds.', 200),
    // Weapons
    LASER_PISTOL: new EquipmentType('laser_pistol', 'Laser Pistol', EQUIPMENT_SLOTS.WEAPON, 'Standard-issue energy sidearm.', 300),
    PLASMA_RIFLE: new EquipmentType('plasma_rifle', 'Plasma Rifle', EQUIPMENT_SLOTS.WEAPON, 'High-powered plasma weapon.', 700),
    VIBROBLADE: new EquipmentType('vibroblade', 'Vibroblade', EQUIPMENT_SLOTS.WEAPON, 'Close-quarters melee weapon.', 250),
});

const EQUIPMENT_TYPES_ALL = Object.values(EQUIPMENT_TYPES);
