function generateEncounter(planet = rndMember(PLANETS), encounterType = rndMember(ENCOUNTER_TYPES_ALL)) {
    const {fleetType} = encounterType
    const fleet = generateFleet(planet, fleetType)
    return new Encounter(gs, encounterType, planet, fleet)
}