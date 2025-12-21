function generateEncounter(planet = rndMember(PLANETS), encounterType = rndMember(ENCOUNTER_TYPES_ALL)) {
    encounterType = rndMember(ENCOUNTER_TYPES_ALL)
    const {fleetType} = encounterType
    const fleet = generateFleet(planet, fleetType)
    for (const s of fleet.ships) s.aiType = encounterType.aiType
    return new Encounter(gs, encounterType, planet, fleet)
}