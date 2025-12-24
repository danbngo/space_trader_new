function generateEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = rndMember(PLANETS), effectTypes = []) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, planet)
    fleet.captain = new Officer(`${encounterType.fleetName} Captain`, 0, 0, 0)
    fleet.captain.credits = rng(fleetType.maxCredits, fleetType.minCredits)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    const effects = effectTypes && effectTypes.length > 0 ? generateEffects(encounterType, effectTypes) : []
    const encounter = new Encounter(gs, encounterType, planet, fleet, effects)
    console.log('generated encounter:', { encounter, encounterType, planet, fleet, effects });
    return encounter
}