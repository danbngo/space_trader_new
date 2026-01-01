// Equipment generator for creating equipment with planet-based quality
// Assumes EquipmentType, Equipment, and planet.civilization.technology

function equipmentGenerator(planet, slot = null) {
    // Pick a random equipment type, optionally filtered by slot
    const pool = slot ? EQUIPMENT_TYPES_ALL.filter(et => et.slot === slot) : EQUIPMENT_TYPES_ALL;
    const equipmentType = rndMember(pool);
    // Quality is based on planet's technology, with some random variation
    const tech = planet.civilization ? planet.civilization.technology : 1.0;
    const quality = Math.max(0.5, tech * rng(0.8, 1.2, false));
    const name = `${equipmentType.name} Mk${Math.round(quality * 10)}`;
    return new Equipment(
        planet,
        name,
        equipmentType,
        quality
    );
}
