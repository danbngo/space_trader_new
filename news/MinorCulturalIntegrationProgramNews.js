class MinorCulturalIntegrationProgramNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} establishes cultural integration programs in ${coloredName(targetPlanet)}'s schools, libraries, and universities!`,
            `${coloredName(planet)}'s cultural integration programs in ${coloredName(targetPlanet)} conclude, having reshaped their cultural landscape!`,
            ``,
            ``,
            NT.MINOR_CULTURAL_INTEGRATION_PROGRAM, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                culture: CL.HIGH,
                security: CL.HIGH,
                taxes: CL.HIGH,
            },
        )

        this.addTargetPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
            },
            {
                culture: CL.LOW,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // This event cannot fail - cultural integration programs are sustained
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Target must not be subject of any other planet
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons]
        const isSubjectOfOther = allBodies.some(body => {
            if (body === p || body === tp || !body.c) return false
            return tp.c.relationships.get(body) === RELATIONSHIP_TYPES.SUBJECT
        })
        
        if (isSubjectOfOther) return false
        
        // Planet must have strong culture and education to export
        const planetValid = p.c.culture > CL.MEDIUM && p.c.education > CL.MEDIUM
        
        // Planet must have tax revenue to spend
        const taxesValid = p.c.taxes < CL.HIGH && p.c.wealth > CL.SLIGHTLY_LOW
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_CULTURAL_INTEGRATION_PROGRAM, NT.MINOR_IDEALOGICAL_SPREAD])
        
        return planetValid && taxesValid && relationshipsValid && !interferingEvent
    }
}
