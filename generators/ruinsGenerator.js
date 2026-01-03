/**
 * Generates ruins in the outer reaches of a star system.
 * @param {StarSystem} starSystem - The star system to place ruins in.
 * @param {number} count - Number of ruins to generate.
 * @returns {Ruins[]} Array of generated ruins.
 */
function generateRuins(starSystem, count = 3) {
    const ruins = [];
    const ruinsTypes = RUINS_TYPES_ALL;
    
    // Place ruins beyond the most distant body
    // Start at 1.2x the max orbital radius, up to 2x
    const minDistance = starSystem.radius * .66
    const maxDistance = starSystem.radius * 0.99
    
    for (let i = 0; i < count; i++) {
        const orbitalRadius = rng(maxDistance, minDistance, false)
        
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
