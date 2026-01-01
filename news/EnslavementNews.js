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
                industry: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_HIGH,
                prestige: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]])),
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
        const ratingsValid = (p.c.economy < CL.MEDIUM || p.c.industry < CL.MEDIUM) && p.c.population < CL.MEDIUM
        // Target must have population to steal
        const targetValid = tp.c.population > CL.VERY_LOW
        // our military must be stronger than theirs
        const militaryValid = p.c.military/tp.c.military > CL.HIGH
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && targetValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
