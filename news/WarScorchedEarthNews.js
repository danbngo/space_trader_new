class WarScorchedEarthNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} adopts a scorched earth policy, destroying territory to blunt ${coloredName(targetPlanet)}'s advance!`,
            `${coloredName(planet)}'s scorched earth campaign ends, leaving devastation in its wake!`,
            ``,
            `Peace treaty halts ${coloredName(planet)}'s scorched earth policy mid-execution!`,
            NT.WAR_SCORCHED_EARTH, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                territory: CL.LOW, // destroyed own territory
                industry: CL.LOW, // factories demolished
                stockpile: CL.LOW, // supplies destroyed
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                technology: CL.LOW, // losses from traps/ambushes
                shipQuality: CL.LOW, // damaged ships
                education: CL.SLIGHTLY_LOW, // losses in hostile territory
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent self-inflicted damage
        Object.assign(this.completeEffects[0], {
            territory: CL.NO_REGRESSION, // destroyed territory stays destroyed
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            stockpile: News.clHalfRegression(this.completeEffects[0].stockpile),
        })
        // Defender: permanent losses from hostile terrain
        Object.assign(this.completeEffects[1], {
            technology: CL.NO_REGRESSION,
            shipQuality: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
        })

        // Cancelled: peace before full destruction, partial damage
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                territory: News.clHalfRegression(CL.LOW),
                industry: News.clHalfRegression(CL.LOW),
                stockpile: News.clHalfRegression(CL.LOW),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                technology: News.clHalfRegression(CL.LOW),
                shipQuality: News.clHalfRegression(CL.LOW),
                education: News.clHalfRegression(CL.SLIGHTLY_LOW),
            })
        ]
    }

    determineOutcome() {
        const {planet, targetPlanet} = this
        // Check if war still ongoing
        const stillAtWar = planet.civilization.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        if (!stillAtWar) {
            this.cancelled = true
        }
    }

    isValid() {
        const {planet, targetPlanet} = this
        // Must be at war
        const relationshipValid = planet.civilization.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high territory to sacrifice
        const territoryValid = planet.civilization.territory > CL.HIGH
        // we need to be desperate
        const militaryValid = planet.militaryPower/targetPlanet.militaryPower < CL.SLIGHTLY_LOW
        // Can't have scorched earth already
        const interferingEvent = News.hasNews(NT.WAR_SCORCHED_EARTH, planet, targetPlanet)
        return militaryValid && relationshipValid && hasWar && territoryValid && !interferingEvent
    }
}
