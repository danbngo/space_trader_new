class CoalitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s dominance on the solar stage is sparking tensions with other planets!`,
            `The anti-${coloredName(planet)} coalition begins to fracture!`,
            `The anti-${coloredName(planet)} coalition solidifies into lasting hostility!`,
            ``,
            NT.COALITION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.LOW,
                onApply: ()=>{
                    const [badNews] = News.calcRelationshipWorseningNews(planet)
                    const numToWorsen = rng(5,3)
                    const rNews = rndMembers(badNews, numToWorsen)
                    for (const n of rNews) n.start()
                }
            })
        ]

        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //population growth and prestige boost from simpler lifestyle
        Object.assign(this.endEffects[0], {
            population: CL.HIGH,
            prestige: News.clHalfRegression(this.endEffects[0].prestige),
        })

        // Failed: coalition persists, permanent diplomatic damage
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.NO_REGRESSION, // lasting damage
                // Relationships already worsened, no further effect needed
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Coalition persists if planet maintains very high prestige (threat remains)
        const failProbability = planet.culture.prestige > CL.VERY_HIGH ? 0.4 : 0.1
        this.failed = Math.random() < failProbability
    }

    isValid() {
        const {planet} = this
        //more likely if really high prestige
        const ratingsValid = planet.culture.prestige > CL.VERY_HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.COALITION])
        const [badNews] = News.calcRelationshipWorseningNews(planet)
        const canFormCoalition = badNews.length >= 3
        return ratingsValid && canFormCoalition && !interferingEvent
    }
}
