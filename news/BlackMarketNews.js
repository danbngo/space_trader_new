class BlackMarketNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s oppressive policies have led to a burgeoning black market and underground economy!`,
            `${coloredName(planet)} makes market reforms that diminish the need for the underground economy!`,
            `${coloredName(planet)}'s authorities fail to stamp out the unlicensed activity as crime and corruption skyrocket!`,
            ``,
            NT.BLACK_MARKET, planet
        )

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.DRUGS, CL.SLIGHTLY_LOW],
                    [CARGO_TYPES.WEAPONS, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                corruption: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_LOW
            },
            {
                corruption: CL.SLIGHTLY_HIGH,
                crime: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on willingness to liberalize (high culture/education, low corruption/security)
        this.rollOutcome(p.c.culture * p.c.education / (p.c.corruption * p.c.security), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high security and low economy (oppressive + poor = black market)
        const ratingsValid = p.c.security > CL.SLIGHTLY_HIGH && p.c.economy < CL.MEDIUM
        
        // Can't have multiple crime/economy events
        const interferingEvent = News.planetHasAnyNews(p, [NT.BLACK_MARKET, NT.ORGANIZED_CRIME, NT.CRIME_WAVE])
        return ratingsValid && !interferingEvent
    }
}
