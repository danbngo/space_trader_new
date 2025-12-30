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
                civilizationMultipliers: new Civilization({
                    inflation: CL.EXTREMELY_LOW,
                    reserves: CL.EXTREMELY_HIGH,
                    economy: CL.HIGH,
                    industry: CL.HIGH,
                    wealth: CL.HIGH,
                    military: CL.VERY_HIGH
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Goods remain high after
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.SLIGHTLY_HIGH,
            reserves: CL.SLIGHTLY_HIGH,
            wealth: CL.SLIGHTLY_HIGH
        }))

        // Failed: boom goes bust, reserves exhausted
        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            industry: CL.LOW,  // Extraction infrastructure damaged
            economy: CL.LOW,  // Economic disruption
            reserves: CL.NO_REGRESSION  // Back to scarcity
        }))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        // Surplus succeeds most of the time
        this.rollOutcome(0.85)
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
