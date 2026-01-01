// Outfitter building: sells tools and headgear
class Outfitter extends Building {
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.OUTFITTER, moon);
        this.inventory = [];
        this.normalize();
    }
    normalize() {
        // Industry increases tool/headgear availability
        const industry = this.planet.civilization ? this.planet.civilization.industry : 1.0;
        const tech = this.planet.civilization ? this.planet.civilization.technology : 1.0;
        this.inventory = [];
        for (let i = 0; i < Math.round(5 + industry * 10); ++i) {
            // Only tools and head slot
            const slot = rng(0, 1) < 0.5 ? EQUIPMENT_SLOTS.TOOL : EQUIPMENT_SLOTS.HEAD;
            this.inventory.push(equipmentGenerator(this.planet, slot));
        }
    }
}
