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
                marketCargoAmounts: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                guildNumOfficers: CL.HIGH,
                officerQuality: CL.SLIGHTLY_HIGH,
                shipQuality: CL.SLIGHTLY_HIGH,
                credits: CL.HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmounts: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                guildNumOfficers: CL.HIGH,
                officerQuality: CL.SLIGHTLY_HIGH,
                shipQuality: CL.SLIGHTLY_HIGH,
                credits: CL.HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering benefits after
        Object.assign(this.endEffects[0], {
            economy: News.clHalfRegression(this.endEffects[0].economy),
            credits: News.clHalfRegression(this.endEffects[0].credits),
        })
        Object.assign(this.endEffects[1], {
            economy: News.clHalfRegression(this.endEffects[1].economy),
            credits: News.clHalfRegression(this.endEffects[1].credits),
        })

        // Failed: economic collapse ruins trade benefits
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                economy: CL.LOW, // economic disruption
                credits: CL.LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                economy: CL.LOW,
                credits: CL.LOW,
            })
        ]

        // Cancelled: tensions suspend trade early
        this.cancelEndEffects = [
            new NewsEffect({
                planet: this.planet,
                marketCargoAmounts: News.clHalfRegression(CL.HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                credits: News.clHalfRegression(CL.HIGH),
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                marketCargoAmounts: News.clHalfRegression(CL.HIGH),
                economy: News.clHalfRegression(CL.SLIGHTLY_HIGH),
                credits: News.clHalfRegression(CL.HIGH),
            })
        ]
    }

    determineEnding() {
        const {planet, targetPlanet} = this
        // Check for hostile relationships
        const rel1 = planet.culture.relationships.get(targetPlanet)
        const rel2 = targetPlanet.culture.relationships.get(planet)
        if (rel1 === RELATIONSHIP_TYPES.HOSTILE || rel1 === RELATIONSHIP_TYPES.WAR ||
            rel2 === RELATIONSHIP_TYPES.HOSTILE || rel2 === RELATIONSHIP_TYPES.WAR) {
            this.cancelled = true
            return
        }
        // Check for economic collapse
        const economyCheck = (planet.culture.economy < CL.LOW) || (targetPlanet.culture.economy < CL.LOW)
        this.failed = economyCheck
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //dont trade with opposing governments
        const govTypesValid = planet.culture.governmentType.opposingType !== targetPlanet.culture.governmentType && targetPlanet.culture.governmentType.opposingType !== planet.culture.governmentType
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.TRADE_AGREEMENT, ...NT_COOPERATION_PREVENTING])
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
