class IsolationismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} retreats into isolationism!`,
            `${coloredName(planet)} ends its isolationism!`,
            NEWS_TYPES.ISOLATIONISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                territoryModifiedBy: 0.7,
                commerceModifiedBy: 0.7,
                marketPricesModifiedBy: 0.8,
                marketCargoAmountsModifiedBy: 0.8,
                blackMarketCargoAmountsModifiedBy: 0.8,
                blackMarketPricesModifiedBy: 0.8,
                creditsModifiedBy: 0.8,
                officerQualityModifiedBy: 0.9,
                shipQualityModifiedBy: 0.9,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 0.5]]),
                forceWithdrawal: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            territoryModifiedBy: 1,
            officerQualityModifiedBy: 1, //lose some knowledge
            shipQualityModifiedBy: 1, //lose some knowledge
        })
    }

    isValid() {
        const {planet} = this
        //must not be a puppet state or anarchic
        const governmentValid = (planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE) && (planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY)
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, NEWS_TYPES_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_DANGEROUS)
        return governmentValid && !interferingEvent
    }
}
