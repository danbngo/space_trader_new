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
                populationModifiedBy: 0.8,
                commercialRatingModifiedBy: 0.7,
                industrialRatingModifiedBy: 0.6,
                guildNumOfficersModifiedBy: 0.6,
                marketPricesModifiedBy: 1.1,
                marketCargoAmountsModifiedBy: 0.8,
                cargoPriceModifiers: new Map([[CARGO_TYPES.MEDICINE, 3]]),
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population does not fully bounce back
        Object.assign(this.endEffects[0], {
            populationModifiedBy: (1 + this.endEffects[0].populationModifiedBy)/2,
        })
    }

    isValid() {
        const {planet} = this
        //happens when population is getting out of hand
        const ratingsValid = planet.culture.population >= 1.2

        const interferingEvent = //can happy anytime, anywhere!
            News.hasNews(NEWS_TYPES.PLAGUE, planet)

        return ratingsValid && !interferingEvent
    }
}
