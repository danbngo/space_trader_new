class RaidingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches raids on neighboring settlements! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations.`,
            NEWS_TYPES.RAIDING, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketCargoAmounts: CL.VERY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                marketPrices: CL.LOW,
                blackMarketPrices: CL.LOW,
                commerce: CL.HIGH,
                military: CL.LOW, // diverting forces to raiding weakens defense
                prestige: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Market goods normalize back, but commerce gains, military loss, and prestige damage are permanent
        Object.assign(this.endEffects[0], {
            marketCargoAmounts: News.CL_NO_REGRESSION,
            blackMarketCargoAmounts: News.CL_NO_REGRESSION,
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            military: News.clHalfRegression(this.endEffects[0].military),
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            prestige: News.CL_NO_REGRESSION,
        })
    }

    isValid() {
        const {planet} = this
        // More likely if military is high and goods are low
        const ratingsValid = planet.culture.military > 1.25 && (planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5 || planet.settlement.blackMarket.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < 0.5)
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.RAIDING])
        return ratingsValid && !interferingEvent
    }
}
