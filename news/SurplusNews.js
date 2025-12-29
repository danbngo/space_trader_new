class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s miners have hit the motherlode! A surplus of goods floods the market!`,
            `${coloredName(planet)}'s resource-rich economy returns to normal.`,
            `${coloredName(planet)}'s resource boom collapses as reserves are exhausted!`,
            ``,
            NT.SURPLUS, planet
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

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //goods remain high After
        Object.assign(this.completeEffects[0], {
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            //economy: News.clHalfRegression(this.completeEffects[0].economy),
            marketCargoAmounts: News.clHalfRegression(this.completeEffects[0].marketCargoAmounts),
            credits: News.clHalfRegression(this.completeEffects[0].credits),
        })

        // Failed: boom goes bust, reserves exhausted
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.LOW, // extraction infrastructure damaged
                economy: CL.LOW, // economic disruption
                marketCargoAmounts: CL.NO_REGRESSION, // back to scarcity
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Surplus fails (goes bust) with small probability
        this.failed = Math.random() < 0.15
    }

    isValid() {
        const {planet} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < CL.LOW
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SURPLUS, NT.DEPRESSION, NT.SCARCITY])
        return ratingsValid && !interferingEvent
    }
}
