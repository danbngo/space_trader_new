class WarSubjugationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} lands its ships and occupies ${coloredName(targetPlanet)}! Its armies raise the flag of ${coloredName(planet)} over the conquered world.`,
            `${coloredName(targetPlanet)} regains independence from ${coloredName(planet)}, bringing the occupation to an end!`,
            NT.SUBJUGATION, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                newRelationship: RELATIONSHIP_TYPES.SOVEREIGN,
                territory: CL.VERY_HIGH,
                military: CL.SLIGHTLY_LOW,
                economy: CL.HIGH,
                marketCargoAmounts: CL.HIGH,
                prestige: CL.VERY_HIGH,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newGovernmentType: GT.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                territory: CL.VERY_LOW,
                military: CL.EXTREMELY_LOW,
                security: CL.VERY_LOW,
                economy: CL.LOW,
                marketCargoAmounts: CL.LOW,
                prestige: CL.VERY_LOW,
                relationsReset: true,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, CL.EXTREMELY_LOW]]),
                forcePeace: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //subjugating others has some lingering effects on territory, military, prestige
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
        //our army must be both large and  significantly better than theirs in every way
        const ratingsValid = (planet.armyPower/targetPlanet.armyPower > CL.HIGH) && (planet.navyPower/targetPlanet.navyPower > CL.HIGH)
        //planet must be at war with the target
        const relationshipValid = planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.WAR
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NT.SUBJUGATION, ...NT_COOPERATIVE])
        return ratingsValid && relationshipValid && !interferingEvent
    }

}
