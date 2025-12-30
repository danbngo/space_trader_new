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
                inflation: CL.EXTREMELY_LOW,
                reserves: CL.EXTREMELY_HIGH,
                economy: CL.HIGH,
                industry: CL.HIGH,
                wealth: CL.HIGH,
                navy: CL.VERY_HIGH,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //goods remain high After
        Object.assign(this.completeEffects[0], {
            industry: News.clHalfRegression(this.completeEffects[0].industry),
            //economy: News.clHalfRegression(this.completeEffects[0].economy),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
        })

        // Failed: boom goes bust, reserves exhausted
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                industry: CL.LOW, // extraction infrastructure damaged
                economy: CL.LOW, // economic disruption
                reserves: CL.NO_REGRESSION, // back to scarcity
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Surplus fails (goes bust) with small probability
        this.failed = Math.random() < 0.15
    }

    isValid() {
        const {planet: p} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = planet.settlement.market.baseCargo.average/MARKET_AVERAGE_CARGO_PER_TYPE < CL.LOW
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SURPLUS, NT.DEPRESSION, NT.SCARCITY])
        return ratingsValid && !interferingEvent
    }
}
