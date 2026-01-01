// Armory building: sells weapons and armor
class Armory extends Building {
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.ARMORY, moon);
        this.inventory = [];
        this.normalize();
    }
    normalize() {
        // Crime increases weapon/armor availability
        const crime = this.planet.civilization ? this.planet.civilization.crime : 1.0;
        this.inventory = [];
        for (let i = 0; i < Math.round(5 + crime * 10); ++i) {
            // Only weapons and armor
            const slot = rng(0, 1) < 0.5 ? EQUIPMENT_SLOTS.WEAPON : EQUIPMENT_SLOTS.ARMOR;
            this.inventory.push(equipmentGenerator(this.planet, slot));
        }
    }
}
