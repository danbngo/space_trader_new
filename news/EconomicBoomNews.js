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
                marketPricesModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 1.5,
                blackMarketCargoAmountsModifiedBy: 1.2,
                commerceModifiedBy: 1.4,
                industryModifiedBy: 1.3,
                creditsModifiedBy: 2,
                shipyardNumShipsModifiedBy: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //credit remains high After
        Object.assign(this.endEffects[0], {
            creditsModifiedBy: (1 + this.endEffects[0].creditsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when economy is already somewhat good. edit: nah, then it never happens lmao.
        //const ratingsValid = (planet.culture.commerce >= 1.2) && (planet.culture.industry >= 1.2)
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NEWS_TYPES.ECONOMIC_BOOM, ...NEWS_TYPES_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING)
        return !interferingEvent
    }
}
