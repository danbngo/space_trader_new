class PlagueNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is struck by a vicious plague! The population is being decimated!`,
            `${coloredName(planet)} develops a cure for their plague!`,
            NEWS_TYPES.PLAGUE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.VERY_LOW,
                commerce: CL.VERY_LOW,
                industry: CL.VERY_LOW,
                guildNumOfficers: CL.VERY_LOW,
                marketPrices: CL.SLIGHTLY_HIGH,
                marketCargoAmounts: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            population: News.clHalfRegression(this.endEffects[0].population),
            guildNumOfficers: News.clHalfRegression(this.endEffects[0].guildNumOfficers),
        })
    }

    isValid() {
        const {planet} = this
        //happens when population is getting out of hand
        const ratingsValid = planet.culture.population > CL.MEDIUM

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NEWS_TYPES.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
