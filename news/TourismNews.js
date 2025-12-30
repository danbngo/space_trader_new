class TourismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${planet.name} turns one of its moons into a resort to attract tourists from across the system!`,
            `${coloredName(planet)} completes its lunar resort, attracting a rush of lucrative tourism!`,
            `${coloredName(planet)}'s lunar resort project fails to attract tourists!`,
            ``,
            NT.TOURISM, planet
        )
        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.VERY_HIGH,
                reserves: CL.LOW,
                industry: CL.LOW,
                wealth: CL.LOW,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.METAL, 2], [CARGO_TYPES.NANITES, 2]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            industry: News.clHalfRegression(this.completeEffects[0].industry), //industry doesnt fully recover
            wealth: 1.5/(0.7),
            economy: CL.SLIGHTLY_HIGH,
            crime: CL.VERY_HIGH,
            corruption: CL.VERY_HIGH,
        })

        // Failed: resort attracts no tourists, investment wasted
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money lost
                industry: CL.NO_REGRESSION, // damaged industry
                prestige: CL.LOW, // embarrassment
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Tourism fails if planet has low prestige or poor economy during construction
        const failProbability = (1 - planet.civilization.prestige) * (1 - planet.civilization.economy) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //more likely to try this out if we need money
        const ratingsValid = planet.civilization.wealth < CL.LOW
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NT.TOURISM, ...NT_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, NT_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS)
        return ratingsValid && !interferingEvent
    }
}
