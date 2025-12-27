class PlagueNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is struck by plague!`,
            `${coloredName(planet)} develops a cure for their plague!`,
            NEWS_TYPES.PLAGUE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: 0.6,
                commerce: 0.7,
                industry: 0.6,
                guildNumOfficers: 0.6,
                marketPrices: 1.1,
                marketCargoAmounts: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            population: (1 + this.endEffects[0].population)/2,
            guildNumOfficers: (1 + this.endEffects[0].guildNumOfficers)/2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when population is getting out of hand
        const ratingsValid = planet.culture.population >= 1.5

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NEWS_TYPES.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
