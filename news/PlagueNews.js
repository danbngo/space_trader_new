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
                civilizationMultipliers: new Civilization({
                    population: CL.VERY_LOW,
                    economy: CL.VERY_LOW,
                    industry: CL.VERY_LOW,
                    education: CL.VERY_LOW,
                    inflation: CL.SLIGHTLY_HIGH,
                    reserves: CL.SLIGHTLY_LOW
                }),
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.EXTREMELY_HIGH]
                ]))
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Population does not fully bounce back
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.SLIGHTLY_LOW,
            education: CL.SLIGHTLY_LOW
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            population: CL.NO_REGRESSION,
            economy: CL.NO_REGRESSION,
            industry: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION,
            prestige: CL.VERY_LOW
        }))
        // Medicine prices stay high
        this.failEffects[0].cargoPriceMultipliers = new CountsMap(new Map([
            [CARGO_TYPES.MEDICINE, CL.NO_REGRESSION]
        ]))

        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher economy/industry = better medical infrastructure
        const cureProbability = (p.c.economy + p.c.industry) / 2
        this.rollOutcome(cureProbability)
    }

    isValid() {
        const {planet: p} = this
        //happens when population is getting out of hand
        const ratingsValid = p.c.population > CL.MEDIUM

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NT.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
