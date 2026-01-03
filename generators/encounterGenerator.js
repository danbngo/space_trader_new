/**
 * Generates a space encounter with enemy fleet and effects.
 * @param {EncounterType} encounterType - The type of encounter to generate.
 * @param {Planet} planet - The planet associated with the encounter.
 * @param {EffectType[]} effectTypes - Array of effect types for environmental hazards.
 * @returns {Encounter} The generated encounter.
 */
function generateRandomEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = null, effectTypes = []) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, encounterType.faction, planet)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    
    // Get the encounter class from the encounterType
    const EncounterClass = encounterType.encounterClass || Encounter
    const encounter = new EncounterClass(encounterType, planet, fleet, effects, null)
    
    console.log('generated encounter:', { encounter, encounterType, planet, fleet, effects });
    return encounter
}

/**
 * @param {Fleet} fleet - The fleet to generate an encounter for.
 */
function generateEncounterForFleet(fleet) {
    const encounterType = EncounterType.getEncounterTypeForFaction(fleet.factionType)
    if (!encounterType) {
        console.warn('Could not determine encounter type for fleet:', fleet)
        return null
    }
    const effectTypes = rollEncounterEffectTypes()
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    
    // Check sneak attack conditions using Fleet method
    const playerSneakAttack = gs.fleet.isBackstabbing(fleet)
    const enemySneakAttack = fleet.isBackstabbing(gs.fleet)
    let undetectedFleet = null
    if (playerSneakAttack && !enemySneakAttack) {
        console.log('Player is performing a sneak attack on the enemy fleet!')
        undetectedFleet = fleet
    }
    else if (enemySneakAttack && !playerSneakAttack) {
        console.log('Enemy fleet is performing a sneak attack on the player!')
        undetectedFleet = gs.fleet
    }

    const EncounterClass = encounterType.encounterClass || Encounter
    const encounter = new EncounterClass(encounterType, fleet.planet, fleet, effects, undetectedFleet)
    return encounter
}