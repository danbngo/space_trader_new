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
                territoryModifiedBy: 1.4,
                militaryModifiedBy: 1.1,
                commerceModifiedBy: 1.2,
                industryModifiedBy: 1.1,
                marketCargoAmountsModifiedBy: 1.4,
                prestigeModifiedBy: 1.2,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                newGovernmentType: GOVERNMENT_TYPES.PUPPET_STATE,
                newRelationship: RELATIONSHIP_TYPES.SUBJECT,
                territoryModifiedBy: 0.7,
                militaryModifiedBy: 0.5,
                securityModifiedBy: 0.6,
                commerceModifiedBy: 0.7,
                industryModifiedBy: 0.75,
                marketCargoAmountsModifiedBy: 0.6,
                prestigeModifiedBy: 0.2,
                relationsReset: true,
                cargoPriceModifiers: new Map([[CARGO_TYPES.ANTIMATTER, 0.5]]),
                forcePeace: true,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //subjugating others has some lingering positive effects on territory, military, presstige
        Object.assign(this.endEffects[0], {
            territoryModifiedBy: (1 + this.endEffects[0].territoryModifiedBy)/2,
            militaryModifiedBy: (1 + this.endEffects[0].militaryModifiedBy)/2,
            prestigeModifiedBy: (1 + this.endEffects[0].prestigeModifiedBy)/2,
            newRelationship: RELATIONSHIP_TYPES.NEUTRAL,
        })
        //being subjugated has some lingering ill effects on territory, military, prestige
        Object.assign(this.endEffects[1], {
            territoryModifiedBy: (1 + this.endEffects[1].territoryModifiedBy)/2,
            militaryModifiedBy: (1 + this.endEffects[1].militaryModifiedBy)/2,
            prestigeModifiedBy: (1 + this.endEffects[0].prestigeModifiedBy)/2,
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
