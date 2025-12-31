class SanctionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} imposes economic sanctions on ${coloredName(targetPlanet)}, damaging both economies!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} have been lifted!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} backfire, causing more domestic harm!`,
            `${coloredName(planet)} ends sanctions on ${coloredName(targetPlanet)} as relations normalize!`,
            NT.SANCTIONS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                reserves: CL.LOW,
                economy: CL.LOW,
            },
            {
                economy: CL.SLIGHTLY_LOW,
            },
            {
                economy: CL.VERY_LOW,
                prestige: CL.LOW
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                reserves: CL.VERY_LOW,
                economy: CL.VERY_LOW,
            },
            {
                economy: CL.SLIGHTLY_LOW
            },
            {
                economy: CL.SLIGHTLY_LOW
            },
            {
                reserves: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
            }
        )
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if relationship improved
        const rel = p.c.relationships.get(tp)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Sanctions succeed unless sanctioner's economy weakens too much
        this.rollOutcome(p.c.economy * 0.7 + 0.3)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //we need a strong economy to pull it off
        const ratingsValid = p.c.economy > CL.HIGH && p.c.wealth >= CL.HIGH
        //aggressor must be hostile towards victim
        const aggressorRelationship = p.c.relationships.get(targetPlanet)
        const relationshipsValid = aggressorRelationship == RELATIONSHIP_TYPES.TENSE
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SANCTIONS, ...NT_COOPERATIVE])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
