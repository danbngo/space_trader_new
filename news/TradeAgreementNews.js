class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} sign an expansive trade agreement, benefitting both planets!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)}'s trade agreement has lapsed!`,
            `Trade negotiations between ${coloredName(planet)} and ${coloredName(targetPlanet)} collapse due to economic instability!`,
            `Rising tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to suspend trade agreement!`,
            NT.TRADE_AGREEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                reserves: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                education: CL.HIGH,
                technology: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering benefits after
        Object.assign(this.completeEffects[0], {
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
        })
        Object.assign(this.completeEffects[1], {
            economy: News.clHalfRegression(this.completeEffects[1].economy),
            wealth: News.clHalfRegression(this.completeEffects[1].wealth),
        })

        // Failed: economic collapse ruins trade benefits
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.LOW, // economic disruption
                wealth: CL.LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                economy: CL.LOW,
                wealth: CL.LOW,
            })
        ]

        // Cancelled: tensions suspend trade early
        this.cancelEffects = [
            new NewsEffect({
                planet: this.planet,
                reserves: News.clHalfRegression(CL.HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                wealth: News.clHalfRegression(CL.HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                reserves: News.clHalfRegression(CL.HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                wealth: News.clHalfRegression(CL.HIGH),
            })
        ]
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Check for hostile relationships
        const rel1 = planet.c.relationships.get(targetPlanet)
        const rel2 = targetPlanet.c.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.TENSE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.TENSE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Check for economic collapse
        const economyCheck = (planet.c.economy < CL.LOW) || (targetPlanet.c.economy < CL.LOW)
        this.failed = economyCheck
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.c.relationships.get(targetPlanet), targetPlanet.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //dont trade with opposing governments
        const govTypesValid = planet.c.governmentType.opposingType !== targetPlanet.c.governmentType && targetPlanet.c.governmentType.opposingType !== planet.c.governmentType
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.TRADE_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
