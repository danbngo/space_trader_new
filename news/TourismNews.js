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
                marketPrices: 1.4,
                marketCargoAmounts: 0.7,
                industry: 0.7,
                credits: 0.7,
                cargoPriceModifiers: new Map([[CARGO_TYPES.METAL, 2], [CARGO_TYPES.NANITES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            industry: (1 + this.endEffects[0].industry)/2, //industry doesnt fully recover
            credits: 1.5/(0.7),
            blackMarketCargoAmounts: 1.4,
            blackMarketPrices: 1.4,
        })
    }

    isValid() {
        const {planet} = this
        //more likely to try this out if we need money
        const ratingsValid = planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS < 0.75
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NEWS_TYPES.TOURISM, ...NEWS_TYPES_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_HOSTILE) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_HOSTILE)
        return ratingsValid && !interferingEvent
    }
}
