class FestivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an extravagant festival open to all visitors, diverting resources to celebrate!`,
            `${coloredName(planet)}'s festival concludes, leaving the planet with enhanced prestige!`,
            `${coloredName(planet)}'s festival is marred by violence and disasters!`,
            ``,
            NT.FESTIVAL, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.LOW,
                crime: CL.HIGH,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new Map([[CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.ASTRONOMICAL]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //economy recovers, prestige is boosted
        Object.assign(this.completeEffects[0], {
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            crime: News.clHalfRegression(this.completeEffects[0].crime),
            //corruption: News.clHalfRegression(this.completeEffects[0].corruption),
            prestige: CL.SLIGHTLY_HIGH,
        })

        // Failed: festival disaster, no prestige gain
        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                wealth: CL.NO_REGRESSION, // money wasted
                economy: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION, // crime persists
                prestige: CL.LOW, // embarrassment
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Festival fails if security too low (riots, crime)
        const failProbability = (1 - planet.civilization.security) * 0.3
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //need high credits to afford it, low prestige to want it
        const ratingsValid = planet.civilization.wealth > CL.SLIGHTLY_HIGH && planet.civilization.prestige < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FESTIVAL, ...NT_ECONOMY_PREVENTING, ...NT_DANGEROUS])
        return ratingsValid && !interferingEvent
    }
}
