class TradeAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Trade agreement signed between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            `Trade agreement ended between ${coloredName(planet)} and ${coloredName(targetPlanet)}`,
            NEWS_TYPES.TRADE_AGREEMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                marketCargoAmountsModifiedBy: 1.3,
                commercialRatingModifiedBy: 1.3,
                //guildNumOfficersModifiedBy: 1.2,
                //officerQualityModifiedBy: 1.1,
                //shipQualityModifiedBy: 1.1,
                creditsModifiedBy: 1.2,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmountsModifiedBy: 1.3,
                commercialRatingModifiedBy: 1.3,
                //guildNumOfficersModifiedBy: 1.2,
                //officerQualityModifiedBy: 1.1,
                //shipQualityModifiedBy: 1.1,
                creditsModifiedBy: 1.2,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
    }

    isValid() {
        const {planet, targetPlanet} = this
        //planets must be neutral or allied towards each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(r => r == RELATIONSHIP_TYPES.NEUTRAL || r == RELATIONSHIP_TYPES.ALLY)
        //unlike research, trade is only blocked if you're actively hostile to each other. 
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.TRADE_AGREEMENT, ...NEWS_TYPES_PROGRESS_PREVENTING])
        return relationshipsValid && !interferingEvent
    }
}
