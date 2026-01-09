class AsylumPolicyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins accepting political dissidents fleeing oppression on ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)} diplomatically resolve tensions over asylum policy!`,
            `Asylum policy triggers escalating tensions between ${coloredName(planet)} and ${coloredName(targetPlanet)}!`,
            ``,
            NT.ASYLUM_POLICY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            }
        )

        // Handle relationship changes on failure
        this.completeEffects[1].onApply = () => {
            const currentRelationship = this.planet.c.relationships.get(this.targetPlanet)
            if (currentRelationship === RELATIONSHIP_TYPES.TENSE) {
                // Escalate to war
                this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.WAR)
                this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.WAR)
            } else if (currentRelationship === RELATIONSHIP_TYPES.NEUTRAL) {
                // Become tense
                this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.TENSE)
                this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.TENSE)
            }
        }
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on both planets' culture and diplomacy (inverse of corruption)
        this.rollOutcome(p.c.culture * tp.c.culture / (p.c.corruption * tp.c.corruption), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Target must NOT be a democracy and NOT at war with us
        const targetValid = tp.c.governmentType !== GT.DEMOCRACY && !Civilization.areAtWar(p, tp)
        
        // Source must have capacity, target must have dissidents to flee
        const ratingsValid = p.c.culture > CL.SLIGHTLY_LOW && tp.c.corruption > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.IMMIGRATION, NT.REFUGEES, NT.DEPORTATION, NT.ASYLUM_POLICY])
        return targetValid && ratingsValid && !interferingEvent
    }
}
