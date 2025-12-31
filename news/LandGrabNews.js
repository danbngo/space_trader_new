class LandGrabNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s navies are infringing on ${coloredName(targetPlanet)}'s territory in a blatant land grab!`,
            `${coloredName(planet)}'s aggressive expansion against ${coloredName(targetPlanet)} finally grinds to a halt!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s navies from their borders!`,
            `Peace treaty forces ${coloredName(planet)} to abandon their border incursions into ${coloredName(targetPlanet)}!`,
            NT.LAND_GRAB, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                army: CL.LOW,
                navy: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                territory: CL.HIGH,
                prestige: News.clHalfRegression(CL.SLIGHTLY_LOW),
            },
            {
                army: CL.NO_REGRESSION,
                navy: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
            },
            {
                territory: News.clHalfRegression(CL.HIGH),
            }
        )

        this.addTargetPlanetEffect(
            {
                targetPlanet: this.planet,
                prestige: CL.LOW,
            },
            {
                territory: CL.LOW,
                prestige: CL.NO_REGRESSION,
            },
            {
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                prestige: CL.HIGH,
            },
            {
                army: News.clHalfRegression(CL.LOW),
                navy: News.clHalfRegression(CL.LOW),
                territory: News.clHalfRegression(CL.LOW),
            }
        )
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if peace declared
        const rel = p.c.relationships.get(tp)
        return rel === RELATIONSHIP_TYPES.NEUTRAL || rel === RELATIONSHIP_TYPES.ALLY
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Expansion fails if target resists successfully
        const resistanceProbability = (tp.militaryPower / p.militaryPower) * 0.35
        this.rollOutcome(1 - resistanceProbability)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //aggressor needs high military and low territory, victim needs territory to take
        const ratingsValid = (p.c.military > CL.SLIGHTLY_HIGH) && (p.c.territory < CL.HIGH) && (targetPlanet.c.territory > CL.SLIGHTLY_LOW)
        //aggressor must have at least 1.5x the military of victim
        const militaryValid = p.c.military >= targetPlanet.c.military * CL.HIGH
        //both must have tensions with each other
        const relationships = [p.c.relationships.get(targetPlanet), targetPlanet.c.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.LAND_GRAB])
        return ratingsValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
