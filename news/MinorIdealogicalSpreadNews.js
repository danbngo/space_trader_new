class MinorIdealogicalSpreadNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} exports its ${coloredName(planet.c.governmentType)} ideology to ${coloredName(targetPlanet)} using agents and sleeper cells!`,
            `${coloredName(planet)}'s ideological infiltration of ${coloredName(targetPlanet)} succeeds, undermining their security and cultural cohesion!`,
            `${coloredName(targetPlanet)}'s authorities root out ${coloredName(planet)}'s sleeper cells, exposing the ideological infiltration!`,
            ``,
            NT.MINOR_IDEALOGICAL_SPREAD, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
                security: CL.SLIGHTLY_LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                security: CL.SLIGHTLY_LOW,
            },
            {
                security: CL.LOW,
                culture: CL.LOW,
            },
            {
                security: CL.SLIGHTLY_HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet) || this.planet.c.governmentType === this.targetPlanet.c.governmentType
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet's ability to infiltrate and spread ideology
        const aggressorScore = (p.c.security * p.c.culture * p.c.education) * p.objectType.powerMultiplier
        
        // Target's ability to resist infiltration
        const victimScore = (tp.c.security * tp.c.culture * tp.c.army) * tp.objectType.powerMultiplier
        
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Must have different government types
        const govValid = p.c.governmentType !== tp.c.governmentType
        
        // Planet must have security apparatus for covert ops
        const planetValid = p.c.security > CL.MEDIUM && p.c.culture > CL.SLIGHTLY_LOW
        
        // Target must not have overwhelming security
        const targetValid = tp.c.security < CL.VERY_HIGH
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_IDEALOGICAL_SPREAD, NT.MINOR_CULTURAL_INTEGRATION_PROGRAM, NT.MINOR_COLOR_REVOLUTION])
        
        return govValid && planetValid && targetValid && relationshipsValid && !interferingEvent
    }
}
