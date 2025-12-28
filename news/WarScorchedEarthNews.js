class WarScorchedEarthNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} adopts a scorched earth policy, destroying territory to blunt ${coloredName(targetPlanet)}'s advance!`,
            `${coloredName(planet)}'s scorched earth campaign ends, leaving devastation in its wake!`,
            NT.WAR_SCORCHED_EARTH, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                territory: CL.LOW, // destroyed own territory
                industry: CL.LOW, // factories demolished
                marketCargoAmounts: CL.LOW, // supplies destroyed
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                shipyardNumShips: CL.LOW, // losses from traps/ambushes
                shipQuality: CL.LOW, // damaged ships
                guildNumOfficers: CL.SLIGHTLY_LOW, // losses in hostile territory
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent self-inflicted damage
        Object.assign(this.endEffects[0], {
            territory: CL.NO_REGRESSION, // destroyed territory stays destroyed
            industry: News.clHalfRegression(this.endEffects[0].industry),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
        })
        // Defender: permanent losses from hostile terrain
        Object.assign(this.endEffects[1], {
            shipyardNumShips: CL.NO_REGRESSION,
            shipQuality: CL.NO_REGRESSION,
            guildNumOfficers: CL.NO_REGRESSION,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.culture.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high territory to sacrifice
        const territoryValid = planet.culture.territory > CL.HIGH
        // we need to be desperate
        const militaryValid = planet.militaryPower/targetPlanet.militaryPower < CL.SLIGHTLY_LOW
        // Can't have scorched earth already
        const interferingEvent = News.hasNews(NT.WAR_SCORCHED_EARTH, planet, targetPlanet)
        return militaryValid && relationshipValid && hasWar && territoryValid && !interferingEvent
    }
}
