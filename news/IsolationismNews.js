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
                territory: CL.LOW,
                commerce: CL.LOW,
                marketPrices: CL.LOW,
                marketCargoAmounts: CL.LOW,
                blackMarketCargoAmounts: CL.LOW,
                blackMarketPrices: CL.LOW,
                credits: CL.LOW,
                officerQuality: CL.SLIGHTLY_LOW,
                shipQuality: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forceWithdrawal: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering price increases and deflation
        Object.assign(this.endEffects[0], {
            population: CL.HIGH,
            territory: News.clHalfRegression(this.endEffects[0].territory),
            officerQuality: News.clHalfRegression(this.endEffects[0].officerQuality), //lose some knowledge
            shipQuality: News.clHalfRegression(this.endEffects[0].shipQuality), //lose some knowledge
            prestige: CL.NO_REGRESSION,
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
