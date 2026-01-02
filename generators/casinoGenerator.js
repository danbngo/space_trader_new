/**
 * Generates casino prizes with high quality.
 * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet the casino is on.
 * @param {number} numPrizes - Number of prizes to generate.
 * @returns {Array<Ship|Equipment|CyberImplant>} Array of prizes.
 */
function generateCasinoPrizes(planet = new Planet(), numPrizes = 5) {
    const prizes = []
    
    for (let i = 0; i < numPrizes; i++) {
        const prizeType = rng(0, 2, true) // 0 = ship, 1 = equipment, 2 = cyber implant
        
        if (prizeType === 0) {
            // Generate a high-quality ship
            const ship = generateShip(planet)
            // Boost quality significantly - aim for 1.5x to 2.5x normal quality
            const qualityBoost = rng(1.5, 2.5, false)
            ship.hull[1] = Math.round(ship.hull[1] * qualityBoost)
            ship.shields[1] = Math.round(ship.shields[1] * qualityBoost)
            ship.lasers = Math.round(ship.lasers * qualityBoost)
            ship.engine = Math.round(ship.engine * qualityBoost)
            ship.cargoSpace = Math.round(ship.cargoSpace * qualityBoost)
            prizes.push(ship)
        } else if (prizeType === 1) {
            // Generate high-quality equipment
            const equipment = equipmentGenerator(planet)
            // Set quality very high (1.5 to 2.5)
            equipment.quality = rng(1.5, 2.5, false)
            prizes.push(equipment)
        } else {
            // Generate high-quality cyber implant
            const implantType = rndMember(CYBER_IMPLANT_TYPES_ALL)
            const quality = rng(1.5, 2.5, false)
            const implant = new CyberImplant(implantType, quality)
            prizes.push(implant)
        }
    }
    
    // Sort prizes by value (cheapest to most expensive)
    prizes.sort((a, b) => {
        const aValue = a.value || 0
        const bValue = b.value || 0
        return aValue - bValue
    })
    
    return prizes
}
