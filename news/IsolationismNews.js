class IsolationismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} retreats into isolationism to take care of its own!`,
            `${coloredName(planet)} ends its isolationism!`,
            NEWS_TYPES.ISOLATIONISM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                territory: 0.7,
                commerce: 0.7,
                marketPrices: 0.8,
                marketCargoAmounts: 0.8,
                blackMarketCargoAmounts: 0.8,
                blackMarketPrices: 0.8,
                credits: 0.8,
                officerQuality: 0.9,
                shipQuality: 0.9,
                prestige: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 0.5]]),
                forceWithdrawal: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            population: 1.2,
            territory: (1 + this.endEffects[0].territory)/2,
            officerQuality: (1 + this.endEffects[0].officerQuality)/2, //lose some knowledge
            shipQuality: (1 + this.endEffects[0].shipQuality)/2, //lose some knowledge
            prestige: 1,
        })
    }

    isValid() {
        const {planet} = this
        //more likely after population collapse
        const ratingsValid = planet.culture.population < 1
        //must not be a puppet state or anarchic
        const governmentValid = (planet.culture.governmentType != GOVERNMENT_TYPES.PUPPET_STATE) && (planet.culture.governmentType != GOVERNMENT_TYPES.ANARCHY)
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent =
            News.planetHasAnyNews(planet, NEWS_TYPES_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_DANGEROUS) 
        return ratingsValid && governmentValid && !interferingEvent
    }
}
