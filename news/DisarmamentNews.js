class DisarmamentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} seeks peace and begins a period of disarmament!`,
            `${coloredName(planet)}'s disarmament period comes to an end!`,
            NEWS_TYPES.DISARMAMENT, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: 0.6,
                territory: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 0.5]]),
                blackMarketCargoAmounts: 0.8,
                blackMarketPrices: 0.6,
            })
        ]

        //system becomes more crowded over time...
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            military: 1, 
            territory: 1,
            commerce: 1.1, //small bonuses to the economy
            industry: 1.1,
            prestige: 1.2,
            blackMarketCargoAmounts: (1 + this.endEffects[0].blackMarketCargoAmounts)/2,
            blackMarketPrices: (1 + this.endEffects[0].blackMarketPrices)/2,
        })
    }

    isValid() {
        const {planet} = this
        //unlikely if planet has a low military already
        const ratingsValid = planet.culture.military > 1.5
        const interferingEvent =
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_MARTIAL) ||
            News.planetHasAnyNews(planet, NEWS_TYPES_MARTIAL)
        return ratingsValid && !interferingEvent
    }
}
