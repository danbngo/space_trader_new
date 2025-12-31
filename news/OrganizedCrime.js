class OrganizedCrimeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is infiltrated by organized crime syndicates, corrupting the planet!`,
            `${coloredName(planet)} conducts high profile arrests and declares victory over the syndicates!`,
            `${coloredName(planet)}'s crackdown on organized crime fails as syndicates consolidate power!`,
            ``,
            NT.ORGANIZED_CRIME, planet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                security: CL.LOW,
                crime: CL.VERY_HIGH,
                corruption: CL.VERY_HIGH
            },
            {
                security: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_HIGH
            },
            {
                security: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Crime crackdown succeeds if security high enough
        this.rollOutcome(p.c.security * 0.55 + 0.45)
    }

    isValid() {
        const {planet: p} = this
        //more likely when black market prices are high (profitable for criminals)
        const ratingsValid = planet.settlement.blackMarket.inflation > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(planet, [NT.ORGANIZED_CRIME, ...NT_CRIME_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
