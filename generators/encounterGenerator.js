function generateEncounter(encounterType = rndMember(ENCOUNTER_TYPES_ALL), planet = rndMember(PLANETS)) {
    const {fleetType} = encounterType
    const fleet = generateFleet(fleetType, planet)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    return new Encounter(gs, encounterType, planet, fleet)
}