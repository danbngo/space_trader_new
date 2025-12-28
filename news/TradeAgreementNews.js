class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} sign an expansive trade agreement, benefitting both planets!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)}'s trade agreement has lapsed!`,
            NEWS_TYPES.TRADE_AGREEMENT, planet, targetPlanet
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
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //dont trade with opposing governments
        const govTypesValid = planet.culture.governmentType.opposingType !== targetPlanet.culture.governmentType && targetPlanet.culture.governmentType.opposingType !== planet.culture.governmentType
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.TRADE_AGREEMENT, ...NEWS_TYPES_TENSE])
        return govTypesValid && relationshipsValid && !interferingEvent
    }
}
