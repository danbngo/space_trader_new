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
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.SLIGHTLY_HIGH]])),
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
        if (possibleBadNews.length < 2) return
        this.rollOutcome(p.c.prestige/p.c.territory/p.c.army/p.c.navy, CL.HIGH)
    }

    shouldCancel() {
        const {planet: p} = this
        // Coalition disbands if planet becomes puppet state (under external control)
        return p.c.governmentType === GT.PUPPET_STATE
    }

    isValid() {
        const {planet: p} = this
        //more likely if REALLY REALLY high territory and military
        const ratingsValid = p.c.territory > CL.HIGH && (p.c.army > CL.HIGH || p.c.navy > CL.HIGH)
        const [badNews] = News.calcRelationshipWorseningNews(p)
        const canFormCoalition = badNews.length >= 2
        return ratingsValid && canFormCoalition
    }
}
