class InvestmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a massive investment to ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s investment in ${coloredName(targetPlanet)} is complete!`,
            NEWS_TYPES.INVESTMENT, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                marketCargoAmountsModifiedBy: 0.8,
                commercialRatingModifiedBy: 0.8,
                creditsModifiedBy: 0.6,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                creditsModifiedBy: 1.2,
            })

        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        Object.assign(this.startEffects[0], {
            creditsModifiedBy: (1 + this.startEffects[0].creditsModifiedBy)/2,
            prestigeRatingModifiedBy: 1.1,
        })
        Object.assign(this.endEffects[1], {
            creditsModifiedBy: 1.2, //even higher!
            marketCargoAmountsModifiedBy: 1.2,
            commercialRatingModifiedBy: 1.2,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //need to have sufficient economy of our own
        const ratingsValid = planet.culture.commercialRating >= 1.2 && planet.settlement.bank.baseCredits >= BANK_AVERAGE_CREDITS*1.2
        //both planets must be neutral or allies
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.NEUTRAL || rel == RELATIONSHIP_TYPES.ALLY)
        //most of the below shouldnt be possible based on above checked but just in case
        const interferingEvent = 
            News.hasNews(planet, NEWS_TYPES.ALLIANCE, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.ALLIANCE, planet) || 
            News.hasNews(planet, NEWS_TYPES.WAR, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.WAR, planet) ||
            News.hasNews(planet, NEWS_TYPES.TENSIONS, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.TENSIONS, planet) ||
            News.hasNews(planet, NEWS_TYPES.BOMBARDMENT, targetPlanet) || News.hasNews(targetPlanet, NEWS_TYPES.BOMBARDMENT, planet)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
