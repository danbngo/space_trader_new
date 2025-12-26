class SurplusNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s miners have hit the motherlode! A surplus of goods floods the market!`,
            `${coloredName(planet)}'s resource-rich economy returns to normal.`,
            NEWS_TYPES.SURPLUS, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketPricesModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 1.5,
                commercialRatingModifiedBy: 1.2,
                industrialRatingModifiedBy: 1.4,
                creditsModifiedBy: 1.3,
                shipyardNumShipsModifiedBy: 1.4,
                cargoPriceModifiers: new Map([[CARGO_TYPES.HOLOCUBES, 2]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //credit and goods remain high After
        Object.assign(this.endEffects[0], {
            creditsModifiedBy: (1 + this.endEffects[0].creditsModifiedBy)/2,
            marketCargoAmountsModifiedBy: (1 + this.endEffects[0].marketCargoAmountsModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //more for flavor than anything, irl you could find goodies at any time
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.SURPLUS, NEWS_TYPES.DEPRESSION, NEWS_TYPES.SCARCITY])
        return !interferingEvent
    }
}
