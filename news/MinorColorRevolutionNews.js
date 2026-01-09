class MinorColorRevolutionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} funds and supports revolutionaries in ${coloredName(targetPlanet)} through covert intelligence operations!`,
            `The color revolution in ${coloredName(targetPlanet)} succeeds - the government falls and a new ${coloredName(planet.c.governmentType)}-aligned regime takes power!`,
            `${coloredName(targetPlanet)}'s authorities crush the color revolution, exposing ${coloredName(planet)}'s involvement!`,
            ``,
            NT.MINOR_COLOR_REVOLUTION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                security: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                prestige: CL.HIGH,
                security: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
                security: CL.SLIGHTLY_LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                security: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
            },
            {
                newGovernmentType: this.planet.c.governmentType,
                security: CL.LOW,
                culture: CL.LOW,
                prestige: CL.LOW,
            },
            {
                security: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet) || Civilization.areAllies(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet's ability to fund and coordinate revolutionaries
        const aggressorScore = (p.c.security * p.c.prestige * p.c.wealth) * p.objectType.powerMultiplier
        
        // Target's ability to suppress revolution
        const victimScore = (tp.c.culture * tp.c.security * tp.c.army) * tp.objectType.powerMultiplier
        
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Must have different government types
        const govValid = p.c.governmentType !== tp.c.governmentType
        
        // Planet must have high security and prestige for covert ops
        const planetValid = p.c.security > CL.HIGH && p.c.prestige > CL.MEDIUM
        
        // Target must have some instability
        const targetValid = tp.c.security < CL.HIGH && tp.c.culture < CL.HIGH
        
        // Cannot be at war or allies
        const relationshipsValid = !Civilization.areAtWar(p, tp) && !Civilization.areAllies(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_COLOR_REVOLUTION, NT.COUP_DETAT, NT.REVOLUTION, NT.CIVIL_WAR])
        
        return govValid && planetValid && targetValid && relationshipsValid && !interferingEvent
    }
}
