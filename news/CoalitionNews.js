class CoalitionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `The military and territorial dominance of ${coloredName(planet)} is sparking tensions with other planets!`,
            `${coloredName(planet)} is able to assuage other planets' concerns and prevent a coalition from rising against it!`,
            `The anti-${coloredName(planet)} coalition solidifies into lasting hostility!`,
            ``,
            NT.COALITION, planet
        )

        this.addPlanetEffect(
            {
                prestige: CL.LOW,
            },
            {
                prestige: CL.HIGH,
            },
            {
                onApply: ()=>{
                    const badNews = News.calcRelationshipWorseningNews(planet)[0]
                    for (const bn of badNews) {
                        if (bn.isValid()) bn.start()
                    }
                }
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // prestige, reducing military/territory gets you out of this
        const possibleBadNews = News.calcRelationshipWorseningNews(p)[0]
        if (possibleBadNews.length < 3) return
        this.rollOutcome(p.c.prestige/p.c.territory/p.c.army/p.c.navy, CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        //more likely if REALLY REALLY high territory and military
        const ratingsValid = p.c.territory > CL.VERY_HIGH && (p.c.army > CL.VERY_HIGH || p.c.navy > CL.VERY_HIGH)
        const [badNews] = News.calcRelationshipWorseningNews(p)
        const canFormCoalition = badNews.length >= 3
        return ratingsValid && canFormCoalition
    }
}
