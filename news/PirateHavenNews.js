class PirateHavenNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Pirates from across the sector are attracted to the lawless environs near ${coloredName(planet)}, using it as a base of operations!`,
            `${coloredName(planet)}'s army and navy work together to scatter the pirates, reducing their activity!`,
            `The local authorities of ${coloredName(planet)} prove incapable of managing the pirate threat, allowing their presence to plague shipping for decades to come!`,
            ``,
            NT.PIRATE_HAVEN, planet
        )

        this.addPlanetEffect(
            {
                security: CL.HIGH,
                economy: CL.MEDIUM,
                commerce: CL.MEDIUM,
                taxes: CL.MEDIUM,
                prestige: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                security: CL.HIGH,
                navy: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                security: CL.VERY_HIGH,
                navy: CL.HIGH,
                economy: CL.HIGH,
                commerce: CL.VERY_HIGH,
                taxes: CL.VERY_HIGH,
                prestige: CL.HIGH,
                corruption: CL.SLIGHTLY_HIGH,
                crime: CL.VERY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on navy and army working together, with security coordination
        this.rollOutcome(p.c.navy * p.c.army * p.c.security / (p.c.corruption * p.c.crime), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires low security and high crime (lawless environment)
        const ratingsValid = p.c.security < CL.SLIGHTLY_HIGH && p.c.crime > CL.MEDIUM
        
        // Can't already have pirate events
        const interferingEvent = News.planetHasAnyNews(p, [NT.PIRATE_HAVEN, NT.PIRATE_ARMADA, NT.ORGANIZED_CRIME])
        return ratingsValid && !interferingEvent
    }
}
