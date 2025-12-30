class WarScorchedEarthNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} adopts a scorched earth policy, destroying territory to blunt ${coloredName(targetPlanet)}'s advance!`,
            `${coloredName(planet)}'s scorched earth campaign ends, leaving devastation in its wake!`,
            ``,
            `Peace treaty halts ${coloredName(planet)}'s scorched earth policy mid-execution!`,
            NT.WAR_SCORCHED_EARTH, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    territory: CL.LOW,  // Destroyed own territory
                    industry: CL.LOW,  // Factories demolished
                    reserves: CL.LOW  // Supplies destroyed
                })
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                civilizationMultipliers: new Civilization({
                    military: CL.SLIGHTLY_LOW,  // Losses from traps/ambushes
                    technology: CL.LOW,  // Damaged ships
                    education: CL.SLIGHTLY_LOW  // Losses in hostile territory
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        // Attacker: permanent self-inflicted damage
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            territory: CL.NO_REGRESSION,  // Destroyed territory stays destroyed
            industry: CL.SLIGHTLY_HIGH,
            reserves: CL.SLIGHTLY_HIGH
        }))
        // Defender: permanent losses from hostile terrain
        this.completeEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.NO_REGRESSION,
            technology: CL.NO_REGRESSION,
            education: CL.NO_REGRESSION
        }))

        // Cancelled: peace before full destruction, partial damage
        this.cancelEffects = this.startEffects.map(effect => effect.getInverse())
        this.cancelEffects[0].civilizationMultipliers.multiply(new Civilization({
            territory: CL.SLIGHTLY_HIGH,
            industry: CL.SLIGHTLY_HIGH,
            reserves: CL.SLIGHTLY_HIGH
        }))
        this.cancelEffects[1].civilizationMultipliers.multiply(new Civilization({
            military: CL.SLIGHTLY_HIGH,
            technology: CL.SLIGHTLY_HIGH,
            education: CL.SLIGHTLY_HIGH
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if war no longer ongoing
        return p.c.relationships.get(tp) !== RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        // Scorched earth always completes (no rollOutcome needed)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = p.c.relationships.get(targetPlanet) === RELATIONSHIP_TYPES.WAR
        // Must have an ongoing war event
        const hasWar = News.hasNews(NT.WAR, planet, targetPlanet)
        // Requires high territory to sacrifice
        const territoryValid = p.c.territory > CL.HIGH
        // we need to be desperate
        const militaryValid = planet.militaryPower/tp.militaryPower < CL.SLIGHTLY_LOW
        // Can't have scorched earth already
        const interferingEvent = News.hasNews(NT.WAR_SCORCHED_EARTH, planet, targetPlanet)
        return militaryValid && relationshipValid && hasWar && territoryValid && !interferingEvent
    }
}
