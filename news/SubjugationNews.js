class SubjugationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} conquers ${coloredName(targetPlanet)}!`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}!`,
            NEWS_TYPES.SUBJUGATION, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                territory: CL.VERY_HIGH,
                military: CL.SLIGHTLY_HIGH,
                commerce: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                marketCargoAmounts: CL.VERY_HIGH,
                prestige: CL.HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                territory: CL.LOW,
                military: CL.EXTREMELY_LOW,
                security: CL.VERY_LOW,
                commerce: CL.LOW,
                industry: 0.75,
                marketCargoAmounts: CL.VERY_LOW,
                prestige: 0.2,
                relationsReset: true,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forcePeace: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //subjugating others has some lingering positive effects on territory, military, presstige
        Object.assign(this.endEffects[0], {
            territory: News.clHalfRegression(this.endEffects[0].territory),
            military: News.clHalfRegression(this.endEffects[0].military),
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })
        //being subjugated has some lingering ill effects on territory, military, prestige
        Object.assign(this.endEffects[1], {
            territory: News.clHalfRegression(this.endEffects[1].territory),
            military: News.clHalfRegression(this.endEffects[1].military),
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //our army must be significantly better than theirs
        const ratingsValid = planet.culture.military > targetPlanet.culture.military*2
        //cant be anarchic or puppet state
        const agencyValid = (planet.culture.governmentType !== GOVERNMENT_TYPES.ANARCHY && planet.culture.governmentType !== GOVERNMENT_TYPES.PUPPET_STATE)
        //planet must be at war with the target
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.SUBJUGATION, ...NEWS_TYPES_COOPERATIVE])
        return ratingsValid && agencyValid && relationshipValid && !interferingEvent
    }

}
