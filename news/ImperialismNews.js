class ImperialismNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} carries out imperialist expansion, seizing territory from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s imperialist expansion against ${coloredName(targetPlanet)} finally grinds to a halt!`,
            NEWS_TYPES.IMPERIALISM, planet, targetPlanet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                targetPlanet: this.targetPlanet,
                military: CL.LOW,
                security: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }),
            new NewsEffect({
                planet: this.targetPlanet,
                targetPlanet: this.planet,
                military: CL.LOW,
                prestige: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())

        //aggressor gains territory, some lingering drops
        Object.assign(this.endEffects[0], {
            territory: CL.HIGH,
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
            security: News.clHalfRegression(this.endEffects[0].security),
            military: News.clHalfRegression(this.endEffects[0].military),
        })
        //victim recovers partially
        Object.assign(this.endEffects[1], {
            territory: CL.NO_REGRESSION,
            prestige: CL.NO_REGRESSION,
        })
    }

    isValid() {
        const {planet, targetPlanet} = this
        //aggressor needs high military and low territory, victim needs territory to take
        const ratingsValid = (planet.culture.military > CL.SLIGHTLY_HIGH) && (planet.culture.territory < CL.HIGH) && (targetPlanet.culture.territory > CL.SLIGHTLY_LOW)
        //aggressor must have at least 1.5x the military of victim
        const militaryValid = planet.culture.military >= targetPlanet.culture.military * CL.HIGH
        //both must have tensions with each other
        const relationships = [planet.culture.relationships.get(targetPlanet), targetPlanet.culture.relationships.get(planet)]
        const relationshipsValid = relationships.every(rel => rel == RELATIONSHIP_TYPES.TENSE || rel == RELATIONSHIP_TYPES.WAR)
        const interferingEvent =
            News.hasAnyNewsBidirectional(planet, targetPlanet, [NEWS_TYPES.IMPERIALISM])
        return ratingsValid && militaryValid && relationshipsValid && !interferingEvent
    }
}
