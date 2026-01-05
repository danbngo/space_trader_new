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
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.HIGH]])),
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
        const {planet: p, targetPlanet: tp} = this
        const aggressorScore = (p.c.navy + p.c.army) * p.objectType.powerMultiplier
        const victimScore = (tp.c.navy + tp.c.army) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //aggressor needs high military and low territory, victim needs territory to take
        const ratingsValid = (p.c.army > CL.MEDIUM && p.c.prestige > tp.c.prestige)
        //aggressor must have at least 1.5x the military of victim
        const militaryValid = p.c.army/tp.c.army > CL.MEDIUM
        //both must have tensions with each other
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent =
            News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
