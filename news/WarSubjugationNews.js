class WarSubjugationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} lands its ships and occupies ${coloredName(targetPlanet)}! Its armies raise the flag of ${coloredName(planet)} over the conquered world.`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}, bringing the occupation to an end!`,
            `${coloredName(targetPlanet)} mounts fierce resistance and repels ${coloredName(planet)}'s occupation forces!`,
            `Peace treaty forces ${coloredName(planet)} to abandon occupation of ${coloredName(targetPlanet)}!`,
            NT.SUBJUGATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                territory: CL.VERY_HIGH,
                prestige: CL.VERY_HIGH
            },
            {
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                territory: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                military: CL.LOW,
                prestige: CL.LOW
            },
            {
                territory: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                governmentType: GT.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                military: CL.EXTREMELY_LOW,
                prestige: CL.VERY_LOW,
                relationsReset: true,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]])),
                forcePeace: true
            },
            {
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                prestige: CL.HIGH,
            },
            {
                prestige: CL.SLIGHTLY_HIGH
            }
        )
    }

    shouldCancel() {
        const {planet: p, targetPlanet: tp} = this
        // Cancel if war no longer ongoing
        return p.c.relationships.get(tp) !== RELATIONSHIP_TYPES.WAR
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Resistance probability based on target's military strength
        const successProbability = 1 - (tp.c.military / p.c.military) * CL.EXTREMELY_LOW
        this.rollOutcome(successProbability)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our army must be both large and  significantly better than theirs in every way
        const ratingsValid = (p.c.army/tp.c.army > CL.HIGH) && (p.c.navy/tp.c.navy > CL.HIGH)
        //planet must be at war with the target
        const relationshipValid = Civilization.areAtWar(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        return ratingsValid && relationshipValid && !interferingEvent
    }

}
