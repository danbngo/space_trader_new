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
                marketPrices: 0.8,
                marketCargoAmounts: 1.5,
                blackMarketCargoAmounts: 1.2,
                commerce: 1.4,
                industry: 1.3,
                credits: 1.5,
                shipyardNumShips: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //credit remains high After
        Object.assign(this.endEffects[0], {
            //this has been causing problems, i think - danmod
            credits: (1 + this.endEffects[0].credits)/2,
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
