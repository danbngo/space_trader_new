/**
 * Generates a space encounter with enemy fleet and effects.
 * @param {EncounterType} encounterType - The type of encounter to generate.
 * @param {Planet} planet - The planet associated with the encounter.
 * @param {EffectType[]} effectTypes - Array of effect types for environmental hazards.
 * @returns {Encounter} The generated encounter.
 */
function generateEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = null, effectTypes = []) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, encounterType.faction, planet)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    
    // Randomly choose formation for pirates and slavers (50% chance to encircle player)
    if ((encounterType === ENCOUNTER_TYPES.PIRATES || encounterType === ENCOUNTER_TYPES.SLAVERS) && Math.random() < 0.5) {
        encounterType.formationType = FORMATION_TYPES.PlayerEncircled
    }
    
    // Get the encounter class from the encounterType
    const EncounterClass = encounterType.encounterClass || Encounter
    const encounter = new EncounterClass(encounterType, planet, fleet, effects)
    
    console.log('generated encounter:', { encounter, encounterType, planet, fleet, effects });
    return encounter
}