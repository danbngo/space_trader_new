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
                marketCargoAmounts: 1.3,
                commerce: 1.2,
                guildNumOfficers: 1.2,
                officerQuality: 1.1,
                shipQuality: 1.1,
                credits: 1.2,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmounts: 1.3,
                commerce: 1.2,
                guildNumOfficers: 1.2,
                officerQuality: 1.1,
                shipQuality: 1.1,
                credits: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.TRADE_AGREEMENT, ...NEWS_TYPES_HOSTILE])
        return relationshipsValid && !interferingEvent
    }
}
