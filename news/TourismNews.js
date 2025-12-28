class TourismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${planet.name} turns one of its moons into a resort to attract tourists from across the system!`,
            `${coloredName(planet)} completes its lunar resort, attracting a rush of lucrative tourism!`,
            NEWS_TYPES.TOURISM, planet
        )
        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.VERY_HIGH,
                marketCargoAmounts: CL.LOW,
                industry: CL.LOW,
                credits: CL.LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 2], [CARGO_TYPES.NANITES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            industry: News.clHalfRegression(this.endEffects[0].industry), //industry doesnt fully recover
            credits: 1.5/(0.7),
            economy: CL.SLIGHTLY_HIGH,
            crime: CL.SLIGHTLY_HIGH,
            blackMarketCargoAmounts: CL.VERY_HIGH,
            blackMarketPrices: CL.VERY_HIGH,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to try this out if we need money
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < CL.LOW
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NEWS_TYPES.TOURISM, ...NEWS_TYPES_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_DANGEROUS)
        return ratingsValid && !interferingEvent
    }
}
