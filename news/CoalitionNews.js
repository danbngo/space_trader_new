class CoalitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The military and territorial dominance of ${coloredName(planet)} is sparking tensions with other planets!`,
            `${coloredName(planet)} is able to assuage other planets' concerns and prevent a coalition from rising against it!`,
            `The anti-${coloredName(planet)} coalition solidifies into lasting hostility!`,
            ``,
            NT.COALITION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.LOW,
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
        })

        // Failed: coalition persists, permanent diplomatic damage
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.NO_REGRESSION,
                onApply: ()=>{
                    const badNews = News.calcRelationshipWorseningNews(planet)[0]
                    for (const bn of badNews) {
                        if (bn.isValid()) bn.start()
                    }
                }
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // prestige, reducing military/territory gets you out of this
        const possibleBadNews = News.calcRelationshipWorseningNews(planet)[0]
        if (possibleBadNews.length < 3) return
        this.rollOutcome(planet.culture.prestige/planet.culture.territory/planet.culture.military, CL.HIGH)
    }

    isValid() {
        const {planet} = this
        //more likely if REALLY REALLY high territory and military
        const ratingsValid = planet.culture.territory > CL.VERY_HIGH && (planet.culture.military > CL.VERY_HIGH || planet.navy > CL.VERY_HIGH || planet.army > CL.VERY_HIGH)
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.COALITION])
        const [badNews] = News.calcRelationshipWorseningNews(planet)
        const canFormCoalition = badNews.length >= 3
        return ratingsValid && canFormCoalition && !interferingEvent
    }
}
