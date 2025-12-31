class EnslavementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins abducting people from ${coloredName(targetPlanet)} and pressing them into service as laborers!`,
            `${coloredName(planet)} has satiated its need for cheap labor and ceasees its abductions from ${coloredName(targetPlanet)}.`,
            `${coloredName(planet)} abductions of ${coloredName(targetPlanet)}'s people cease after multiple armed skirmishes!`,
            `Improved relations prompt ${coloredName(planet)} to free abducted populations from ${coloredName(targetPlanet)}!`,
            NT.ENSLAVEMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                targetPlanet: this.targetPlanet,
                industry: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
            },
            {
                industry: CL.HIGH,
                population: CL.HIGH,
                prestige: CL.LOW,
            },
            {
                population: CL.LOW,
                prestige: CL.VERY_LOW,
            },
            {
                prestige: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                targetPlanet: this.planet,
                population: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                education: CL.SLIGHTLY_LOW,
                prestige: CL.LOW,
            },
            {
                population: CL.LOW,
                security: CL.LOW,
                education: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                prestige: CL.VERY_LOW
            },
            {
                culture: CL.HIGH,
                prestige: CL.HIGH,
            }
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        this.rollOutcome((p.c.army + p.c.navy + p.c.security)/(tp.c.army + tp.c.navy + p.c.corruption), CL.HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // More likely if economy/industry AND population is low (seeking economic boost)
        const ratingsValid = (p.c.economy < CL.LOW || p.c.industry < CL.LOW) && p.c.population < CL.SLIGHTLY_LOW
        // Target must have population to steal
        const targetValid = tp.c.population > CL.LOW
        // our military must be stronger than theirs
        const militaryValid = (p.c.army + p.c.navy) > (tp.c.army + tp.c.navy) * CL.HIGH
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        // Both parties must be at least TENSE (TENSE or WAR)
        // Must not already have this event between these planets
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
