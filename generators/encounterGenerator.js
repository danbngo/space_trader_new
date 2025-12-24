function generateEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = rndMember(PLANETS), effectTypes = []) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, planet)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    const encounter = new Encounter(gs, encounterType, planet, fleet, effects)
    console.log('generated encounter:', { encounter, encounterType, planet, fleet, effects });
    return encounter
}