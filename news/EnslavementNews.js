class EnslavementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins abducting people from ${coloredName(targetPlanet)} and pressing them into service as laborers!`,
            `${coloredName(planet)} has satiated its need for cheap labor and ceasees its abductions from ${coloredName(targetPlanet)}.`,
            `${coloredName(planet)} abductions of ${coloredName(targetPlanet)}'s people cease after multiple armed skirmishes!`,
            `Improved relations prompt ${coloredName(planet)} to free abducted populations from ${coloredName(targetPlanet)}!`,
            NT.ENSLAVEMENT, planet, targetPlanet
        )

        this.addEffect(
            {
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_HIGH,
                security: CL.LOW,
                navy: CL.LOW,
                army: CL.LOW,
                prestige: CL.LOW,
                culture: CL.LOW,
                corruption: CL.HIGH,
            },
            {
                economy: CL.HIGH,
                industry: CL.HIGH,
                population: CL.HIGH,
                security: CL.LOW,
                prestige: CL.LOW,
                culture: CL.LOW,
                corruption: CL.HIGH,
            },
            {
                population: CL.LOW,
                security: CL.VERY_LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                prestige: CL.VERY_LOW,
            },
            {
                security: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_HIGH,
            }
        )

        this.addEffect(
            {
                planet: this.targetPlanet,
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
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.ENSLAVEMENT])
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
