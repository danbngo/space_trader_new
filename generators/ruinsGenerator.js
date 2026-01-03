/**
 * Generates ruins in the outer reaches of a star system.
 * @param {StarSystem} starSystem - The star system to place ruins in.
 * @param {number} count - Number of ruins to generate.
 * @returns {Ruins[]} Array of generated ruins.
 */
function generateRuins(starSystem, count = 3) {
    const ruins = [];
    const ruinsTypes = RUINS_TYPES_ALL;
    
    // Find the most distant body (planet or dwarf planet)
    let maxOrbitalRadius = 0;
    
    for (const planet of starSystem.planets) {
        const distance = Math.sqrt(planet.x * planet.x + planet.y * planet.y);
        if (distance > maxOrbitalRadius) {
            maxOrbitalRadius = distance;
        }
    }
    
    for (const dwarf of starSystem.dwarfPlanets) {
        const distance = Math.sqrt(dwarf.x * dwarf.x + dwarf.y * dwarf.y);
        if (distance > maxOrbitalRadius) {
            maxOrbitalRadius = distance;
        }
    }
    
    // Place ruins beyond the most distant body
    // Start at 1.2x the max orbital radius, up to 2x
    const minDistance = maxOrbitalRadius * 1.2;
    const maxDistance = maxOrbitalRadius * 2.0;
    
    for (let i = 0; i < count; i++) {
        const orbitalRadius = minDistance + Math.random() * (maxDistance - minDistance);
        
        // Random ruins type
        const ruinsType = ruinsTypes[Math.floor(Math.random() * ruinsTypes.length)];
        
        // Generate unique name
        const name = `${ruinsType.name} ${String.fromCharCode(65 + i)}`;
        
        const orbit = new Orbit(orbitalRadius)
        const ruin = new Ruins(name, ruinsType, RUINS_RADIUS, orbit);
        ruins.push(ruin);
    }
    
    return ruins;
}
