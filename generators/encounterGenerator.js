function generateEncounter(planet = rndMember(PLANETS), encounterType = rndMember(ENCOUNTER_TYPES_ALL)) {
    encounterType = ENCOUNTER_TYPES.MERCHANTS //danmod: for testing
    const {fleetType} = encounterType
    const fleet = generateFleet(planet, fleetType)
    return new Encounter(gs, encounterType, planet, fleet)
}