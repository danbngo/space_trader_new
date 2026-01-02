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
                economy: CL.LOW,
            },
            {
                navy: CL.SLIGHTLY_HIGH,
                security: CL.HIGH,
                prestige: CL.HIGH,
                commerce: CL.SLIGHTLY_HIGH
            },
            {
                navy: CL.VERY_LOW,
                prestige: CL.LOW,
                territory: CL.LOW,
                inflation: CL.SLIGHTLY_HIGH,
                reserves: CL.LOW,
                economy: CL.LOW,
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
        const ratingsValid = p.c.navy > CL.SLIGHTLY_LOW && (p.c.crime > CL.MEDIUM || p.c.security < CL.MEDIUM)
        
        // Can't already have major pirate events
        const interferingEvent = News.planetHasAnyNews(p, [NT.PIRATE_ARMADA, NT.PIRATE_HAVEN])
        return ratingsValid && !interferingEvent
    }
}
