class CulturalRenaissanceNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches an ambitious arts initiative, funding artists and cultural institutions to revitalize society!`,
            `${coloredName(planet)}'s cultural renaissance explodes with brilliant artistic output, captivating the entire system!`,
            `${coloredName(planet)}'s arts funding produces only esoteric, avant-garde works that confound and alienate the public!`,
            ``,
            NT.CULTURAL_RENAISSANCE, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                culture: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.HIGH]])),
            },
            {
                wealth: CL.LOW,
                culture: CL.EXTREMELY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.HIGH,
                education: CL.SLIGHTLY_HIGH
            },
            {
                wealth: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
        
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on education and existing culture
        this.rollOutcome(p.c.education * p.c.culture, CL.LOW)
    }

    isValid() {
        const {planet: p} = this
        // Need low culture but decent wealth to fund the initiative
        const ratingsValid = p.c.culture < CL.SLIGHTLY_LOW && p.c.wealth > CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
