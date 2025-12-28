class RaidingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches raids on neighboring settlements! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations!`,
            NEWS_TYPES.RAIDING, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketCargoAmounts: CL.VERY_HIGH,
                blackMarketCargoAmounts: CL.VERY_HIGH,
                marketPrices: CL.VERY_LOW,
                blackMarketPrices: CL.VERY_LOW,
                territory: CL.SLIGHTLY_HIGH,
                commerce: CL.HIGH,
                military: CL.LOW, // diverting forces to raiding weakens defense
                prestige: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Market goods normalize back, but commerce gains, military loss, and prestige damage are permanent
        Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION,
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            military: News.clHalfRegression(this.endEffects[0].military),
            marketPrices: News.clHalfRegression(this.endEffects[0].marketPrices),
            blackMarketPrices: News.clHalfRegression(this.endEffects[0].blackMarketPrices),
            territoy: CL.NO_REGRESSION,
            marketCargoAmounts: CL.NO_REGRESSION,
            blackMarketCargoAmounts: CL.NO_REGRESSION,
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
