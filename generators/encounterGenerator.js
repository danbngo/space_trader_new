/**
 * Generates a space encounter with enemy fleet and effects.
 * @param {EncounterType} encounterType - The type of encounter to generate.
 * @param {Planet} planet - The planet associated with the encounter.
 * @param {EffectType[]} effectTypes - Array of effect types for environmental hazards.
 * @returns {Encounter} The generated encounter.
 */
function generateEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = rndMember(PLANETS), effectTypes = []) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, planet)
    fleet.captain = new Officer(`${encounterType.fleetType.name} Captain`, 0)
    fleet.captain.credits = rng(fleetType.maxCredits, 0)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    
    // Get the encounter class from the encounterType
    const EncounterClass = encounterType.encounterClass || Encounter
    const encounter = new EncounterClass(gs, encounterType, planet, fleet, effects)
    
    console.log('generated encounter:', { encounter, encounterType, planet, fleet, effects });
    return encounter
}