class PirateArmadaNews extends News {
    constructor(planet = new Planet()) {
        super(
            `Several major pirate groups have coalesced into one massive pirate fleet near ${coloredName(planet)} that seeks to destroy the navy once and for all!`,
            `${coloredName(planet)}'s navy is able to break the backs of the pirates in a series of decisive engagements!`,
            `The bulk of ${coloredName(planet)}'s navy is whittled down in a brutal battle of attrition against the numerous pirates!`,
            `${coloredName(planet)}'s navy continues its desperate struggle against the pirate armada!`,
            NT.PIRATE_ARMADA, planet
        )

        this.addPlanetEffect(
            {
                navy: CL.VERY_HIGH,
                taxes: CL.HIGH,
                wealth: CL.MEDIUM,
                reserves: CL.MEDIUM,
                commerce: CL.HIGH,
                economy: CL.MEDIUM
            },
            {
                navy: CL.SLIGHTLY_HIGH,
                security: CL.HIGH,
                prestige: CL.HIGH,
                commerce: CL.SLIGHTLY_HIGH
            },
            {
                navy: CL.VERY_HIGH,
                prestige: CL.VERY_HIGH,
                territory: CL.HIGH,
                taxes: CL.EXTREMELY_HIGH,
                inflation: CL.SLIGHTLY_HIGH,
                reserves: CL.VERY_HIGH,
                economy: CL.HIGH,
                commerce: CL.VERY_HIGH,
                population: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on navy strength, technology (tactics/weapons), and wealth (sustaining operations)
        this.rollOutcome(p.c.navy * p.c.technology * p.c.wealth / p.c.corruption, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires existing navy and some pirate activity (crime/low security)
        const ratingsValid = p.c.navy > CL.MEDIUM && (p.c.crime > CL.SLIGHTLY_HIGH || p.c.security < CL.SLIGHTLY_HIGH)
        
        // Can't already have major pirate events
        const interferingEvent = News.planetHasAnyNews(p, [NT.PIRATE_ARMADA, NT.PIRATE_HAVEN])
        return ratingsValid && !interferingEvent
    }
}
