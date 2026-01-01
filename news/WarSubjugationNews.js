class WarSubjugationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} lands its ships and occupies ${coloredName(targetPlanet)}! Its armies raise the flag of ${coloredName(planet)} over the conquered world.`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}, bringing the occupation to an end!`,
            ``,
            `Peace treaty forces ${coloredName(planet)} to abandon occupation of ${coloredName(targetPlanet)}!`,
            NT.SUBJUGATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                territory: CL.EXTREMELY_HIGH,
                prestige: CL.EXTREMELY_HIGH,
                economy: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
                inflation: CL.LOW,
                taxes: CL.LOW, //tax them instead
                army: CL.SLIGHTLY_LOW, //requires some troops to keep them in line
                security: CL.LOW
            },
            {
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {}, //it cant fail due to timespan issue
            {
                prestige: CL.SLIGHTLY_HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                governmentType: GT.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                army: CL.EXTREMELY_LOW,
                navy: CL.EXTREMELY_LOW,
                prestige: CL.VERY_LOW,
                economy: CL.LOW, //boot goes on neck
                industry: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
                inflation: CL.HIGH,
                taxes: CL.HIGH, 
                relationsReset: true,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]])),
                forcePeace: true
            },
            {
                newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
                prestige: CL.SLIGHTLY_LOW
            },
            {},
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.military + this.planet.c.army)/2/(this.targetPlanet.c.military), CL.HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        //our army must be both large and  significantly better than theirs in every way
        const ratingsValid = p.c.army > CL.HIGH && (p.c.army/tp.c.army > CL.HIGH) && (p.c.navy/tp.c.navy > CL.HIGH)
        //planet must be at war with the target
        const relationshipValid = Civilization.areAtWar(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATIVE)
        // Cannot subjugate if target has active planetary defense platform
        const hasDefensePlatform = News.planetHasAnyNews(tp, [NT.PLANETARY_DEFENSE])
        return ratingsValid && relationshipValid && !interferingEvent && !hasDefensePlatform
    }

}
