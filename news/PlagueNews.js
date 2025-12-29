class PlagueNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is struck by a vicious plague! The population is being decimated!`,
            `${coloredName(planet)} develops a cure for their plague!`,
            `${coloredName(planet)} fails to contain the plague! The death toll is catastrophic!`,
            '',
            NT.PLAGUE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                guildNumOfficers: CL.VERY_LOW,
                marketPrices: CL.SLIGHTLY_HIGH,
                marketCargoAmounts: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, CL.EXTREMELY_HIGH]]),
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.completeEffects[0], {
            population: News.clHalfRegression(this.completeEffects[0].population),
            guildNumOfficers: News.clHalfRegression(this.completeEffects[0].guildNumOfficers),
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                guildNumOfficers: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, CL.NO_REGRESSION]]),
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher economy/industry = better medical infrastructure
        const cureProbability = (planet.culture.economy + planet.culture.industry) / 2
        this.failed = Math.random() > cureProbability
    }

    isValid() {
        const {planet} = this
        //happens when population is getting out of hand
        const ratingsValid = planet.culture.population > CL.MEDIUM

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NT.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
