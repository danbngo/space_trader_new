class CoalitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s dominance on the solar stage has prompted the other planets to form a coalition against them!`,
            `The anti-${coloredName(planet)} coalition begins to fracture!`,
            NT.COALITION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                prestige: CL.LOW,
                onApply: ()=>{
                    const news = this.getRelationshipWorseningNews()
                    const numToWorsen = rng(5,3)
                    const rNews = rndMembers(news, numToWorsen)
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
    }

    isValid() {
        const {planet} = this
        //more likely if really high prestige
        const ratingsValid = planet.culture.prestige > CL.VERY_HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.COALITION])
        const canFormCoalition = this.getRelationshipWorseningNews().length >= 3
        return ratingsValid && canFormCoalition && !interferingEvent
    }

    getRelationshipWorseningNews = () => {
        const possibleHostileNews = []
        const possibleWarNews = []
        for (const otherPlanet of gs.system.planets) {
            if (otherPlanet == this.planet) continue
            const relationship = otherPlanet.culture.relationships.get(this.planet)
            if (relationship == RELATIONSHIP_TYPES.NEUTRAL) {
                const n = new TensionsNews(otherPlanet, this.planet)
                //skip political considerations as this is about raw power/survival
                if (n.isValid(true)) possibleHostileNews.push(n)
            } else if (relationship == RELATIONSHIP_TYPES.TENSE) {
                const n = new WarNews(otherPlanet, this.planet)
                //skip political considerations as this is about raw power/survival
                if (n.isValid(true)) possibleWarNews.push(n)
            }
        }
        const news = [...possibleHostileNews, ...possibleWarNews]
        return news
    }
}
