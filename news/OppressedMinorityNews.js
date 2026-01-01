class OppressedMinorityNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} has a sizeable minority of citizens from ${coloredName(planet)}, and is oppressing them mercilessly!`,
            `${coloredName(planet)} applies diplomatic and military pressure to convince ${coloredName(targetPlanet)} to change tack!`,
            `${coloredName(planet)} is unable to dissuade ${coloredName(targetPlanet)} from brutalizing its diaspora!`,
            ``,
            NT.OPPRESSED_MINORITY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {},
            {
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.SLIGHTLY_LOW
            },
            {
                corruption: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on planet's prestige/navy vs target's corruption/security
        this.rollOutcome(p.c.prestige * p.c.navy / (tp.c.corruption * tp.c.security), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Target must be oppressive, planet must have influence
        const ratingsValid = tp.c.security > CL.SLIGHTLY_HIGH && tp.c.culture < CL.MEDIUM && p.c.prestige > CL.SLIGHTLY_LOW
        
        // Must not be allies (wouldn't oppress ally's citizens)
        const relationshipsValid = !Civilization.areAllies(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.OPPRESSED_MINORITY, NT.DEPORTATION, NT.DIASPORA_RETURNS])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
