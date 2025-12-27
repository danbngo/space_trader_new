class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            NEWS_TYPES.ECONOMIC_BOOM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPrices: CL.LOW,
                marketCargoAmounts: CL.VERY_HIGH,
                blackMarketCargoAmounts: CL.HIGH,
                commerce: CL.VERY_HIGH,
                industry: CL.HIGH,
                credits: CL.VERY_HIGH,
                shipyardNumShips: CL.VERY_HIGH,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            credits: News.clHalfRegression(this.endEffects[0].credits),
        })
    }

    isValid() {
        const {planet} = this
        //const ratingsValid = (planet.culture.commerce >= 1.2) && (planet.culture.industry >= 1.2)
        //basically just a bonus for not being in a war or anything stupid
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NEWS_TYPES.ECONOMIC_BOOM, ...NEWS_TYPES_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_HOSTILE) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_HOSTILE)
        return !interferingEvent
    }
}
