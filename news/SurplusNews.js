class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s miners have hit the motherlode! A surplus of goods floods the market!`,
            `${coloredName(planet)}'s resource-rich economy returns to normal.`,
            `${coloredName(planet)}'s resource boom collapses as reserves are exhausted!`,
            ``,
            NT.SURPLUS, planet
        )

        this.addPlanetEffect(
            {
                reserves: CL.EXTREMELY_HIGH,
                industry: CL.HIGH,
            },
            {
                industry: CL.SLIGHTLY_HIGH,
                reserves: CL.SLIGHTLY_HIGH,
            },
            {
                industry: CL.LOW,
                reserves: CL.NO_REGRESSION
            }
        )
    }

    determineOutcome() {
        // Surplus succeeds most of the time
        this.rollOutcome(0.85)
    }

    isValid() {
        const {planet: p} = this
        //we needed to be resource scarce to be looking for them so hard
        const ratingsValid = planet.c.reserves/MARKET_AVERAGE_CARGO_PER_TYPE < CL.LOW
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NT.SURPLUS, NT.DEPRESSION, NT.SCARCITY])
        return ratingsValid && !interferingEvent
    }
}
