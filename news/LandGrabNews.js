class LandGrabNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s army pushes aggressively in disputed territories that are claimed by both it and ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} has wrested control of several asteroids and other small bodies from ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} repels ${coloredName(planet)}'s ships from the disputed territories!`,
            `Peace treaty forces ${coloredName(planet)} to abandon their border incursions into ${coloredName(targetPlanet)}!`,
            NT.LAND_GRAB, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                navy: CL.SLIGHTLY_LOW,
                army: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                territory: CL.HIGH,
                army: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.VERY_LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW,
            },
            {
                prestige: CL.LOW,
                territory: CL.LOW,
            },
            {
                prestige: CL.HIGH,
                culture: CL.HIGH
            }
        )
    }

    shouldCancel() {
        return Civilization.areAlliesOrNeutral(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.navy + this.planet.c.army) / (this.targetPlanet.c.navy + this.targetPlanet.c.army), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //aggressor needs high military and low territory, victim needs territory to take
        const ratingsValid = (p.c.army > CL.SLIGHTLY_HIGH && p.c.prestige > tp.c.prestige)
        //aggressor must have at least 1.5x the military of victim
        const militaryValid = p.c.army >= tp.c.army * CL.HIGH
        //both must have tensions with each other
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent =
            News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
