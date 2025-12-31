class WarScorchedEarthNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} adopts a scorched earth policy, destroying territory to blunt ${coloredName(targetPlanet)}'s advance!`,
            `${coloredName(planet)}'s scorched earth campaign ends, leaving devastation in its wake!`,
            ``,
            `Peace treaty halts ${coloredName(planet)}'s scorched earth policy mid-execution!`,
            NT.WAR_SCORCHED_EARTH, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                territory: CL.LOW,
                industry: CL.LOW,
            },
            {
                territory: CL.NO_REGRESSION,
            },
            {},
            {
                territory: CL.SLIGHTLY_HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                military: CL.SLIGHTLY_LOW,
            },
            {
                military: CL.NO_REGRESSION,
            },
            {},
            {}
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // Scorched earth always completes (no rollOutcome needed)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        const territoryValid = p.c.territory > CL.HIGH
        // we need to be desperate
        const militaryValid = p.c.military/tp.c.military < CL.SLIGHTLY_LOW
        // Can't have scorched earth already
        const interferingEvent = News.hasNews(NT.WAR_SCORCHED_EARTH, p, tp)
        return militaryValid && relationshipValid && territoryValid && !interferingEvent
    }
}
