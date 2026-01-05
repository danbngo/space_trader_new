class OrganizedCrimeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s gangs consolidate into organized syndicates, threatening to corrupt the entire planet!`,
            `${coloredName(planet)} conducts high profile arrests and breaks the backs of the syndicates!`,
            `${coloredName(planet)}'s crackdown on organized crime fails as syndicates consolidate power!`,
            ``,
            NT.ORGANIZED_CRIME, planet
        )

        this.addPlanetEffect(
            {
                security: CL.LOW,
                crime: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_LOW,
                corruption: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.DRUGS, CL.VERY_LOW], [CARGO_TYPES.WEAPONS, CL.VERY_LOW]])),
            },
            {
                security: CL.VERY_LOW,
                crime: CL.HIGH,
                economy: CL.LOW,
                corruption: CL.EXTREMELY_HIGH
            },
            {
                security: CL.HIGH,
                crime: CL.LOW,
                corruption: CL.EXTREMELY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Crime crackdown succeeds if security high enough
        this.rollOutcome(p.c.security / p.c.corruption / p.c.crime, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely when black market prices are high (profitable for criminals)
        const ratingsValid = p.c.corruption > CL.HIGH || p.c.crime > CL.HIGH
        const interferingEvent = News.planetHasAnyNews(p, NT_CRIME_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
