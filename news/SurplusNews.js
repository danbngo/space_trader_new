class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s miners have hit the motherlode! A surplus of goods floods the market!`,
            `${coloredName(planet)}'s resource-rich economy returns to normal.`,
            NEWS_TYPES.SURPLUS, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.EXTREMELY_LOW,
                marketCargoAmounts: CL.EXTREMELY_HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                credits: CL.HIGH,
                shipyardNumShips: CL.VERY_HIGH,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //goods remain high After
        Object.assign(this.endEffects[0], {
            industry: News.clHalfRegression(this.endEffects[0].industry),
            //economy: News.clHalfRegression(this.endEffects[0].economy),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            credits: News.clHalfRegression(this.endEffects[0].credits),
        })
    }

    isValid() {
        const {planet} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < CL.LOW
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SURPLUS, NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY])
        return ratingsValid && !interferingEvent
    }
}
