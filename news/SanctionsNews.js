class SanctionsNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} imposes economic sanctions on ${coloredName(targetPlanet)}, damaging both economies!`,
            `${coloredName(planet)}'s sanctions on ${coloredName(targetPlanet)} have been lifted!`,
            NEWS_TYPES.SANCTIONS, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                marketCargoAmounts: CL.LOW,
                economy: CL.LOW,
                credits: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmounts: CL.VERY_LOW,
                economy: CL.VERY_LOW,
                guildNumOfficers: CL.LOW,
                credits: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering damage after
        Object.assign(this.endEffects[0], {
            economy: News.clHalfRegression(this.endEffects[0].economy),
            credits: News.clHalfRegression(this.endEffects[0].credits),
        })
        Object.assign(this.endEffects[1], {
            economy: News.clHalfRegression(this.endEffects[1].economy),
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //we need a strong economy to pull it off
        const ratingsValid = planet.culture.economy > CL.HIGH && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS >= CL.HIGH
        //aggressor must be hostile towards victim
        const aggressorRelationship = planet.culture.relationships.get(targetPlanet)
        const relationshipsValid = aggressorRelationship == RELATIONSHIP_TYPES.TENSE
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.SANCTIONS, ...NEWS_TYPES_TENSE])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
