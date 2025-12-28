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
                commerce: CL.LOW,
                credits: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                marketCargoAmounts: CL.VERY_LOW,
                commerce: CL.VERY_LOW,
                guildNumOfficers: CL.LOW,
                credits: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering damage after
        Object.assign(this.endEffects[0], {
            commerce: News.clHalfRegression(this.endEffects[0].commerce),
            credits: News.clHalfRegression(this.endEffects[0].credits),
        })
        Object.assign(this.endEffects[1], {
            commerce: News.clHalfRegression(this.endEffects[1].commerce),
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //we need a strong economy to pull it off
        const ratingsValid = planet.culture.commerce > CL.HIGH && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS >= CL.HIGH
        //aggressor must be hostile towards victim
        const aggressorRelationship = planet.culture.relationships.get(targetPlanet)
        const relationshipsValid = aggressorRelationship == RELATIONSHIP_TYPES.HOSTILE
        //blocked if already at war or other hostile actions
        const interferingEvent = News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.SANCTIONS, ...NEWS_TYPES_HOSTILE])
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}
