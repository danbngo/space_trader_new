class WarInvasionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches drop pods and begins a ground invasion of ${coloredName(targetPlanet)}!`,
            `The invasion of ${coloredName(targetPlanet)} concludes with heavy casualties!`,
            '',
            `${coloredName(planet)}'s invasion of ${coloredName(targetPlanet)} is called off! Ceasefire declared!`,
            NT.WAR_INVASION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                education: CL.LOW,
            },
            {
                education: CL.NO_REGRESSION,
            },
            {},
            {}
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_HIGH
            },
            {},
            {
                population: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check if peace was forced (relationships changed during invasion)
        const currentRel1 = p.c.relationships.get(targetPlanet)
        const currentRel2 = tp.c.relationships.get(planet)
        this.cancelled = (currentRel1 !== RELATIONSHIP_TYPES.WAR || currentRel2 !== RELATIONSHIP_TYPES.WAR)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (p.c.navy > tp.c.navy) && (p.c.army > tp.c.army)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, planet, targetPlanet)
        return relationshipValid && hasWar && militaryValid && !interferingEvent
    }
}
