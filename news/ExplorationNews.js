class ExplorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends out its best and brightest explorers to survey and claim small bodies in the kuiper belt!`,
            `${coloredName(planet)}'s exploration mission succeeds, claiming vast new territories!`,
            `${coloredName(planet)}'s exploration mission fails! Explorers lost in deep space!`,
            '',
            NT.EXPLORATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                education: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                technology: CL.LOW,
                navy: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
            })
        ]

        //exploration pays off with territory and prestige
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            education: CL.NO_REGRESSION,
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            //economy: CL.SLIGHTLY_HIGH,
            //industry: CL.SLIGHTLY_HIGH,
            technology: CL.NO_REGRESSION,
            territory: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                education: CL.NO_REGRESSION,
                technology: CL.NO_REGRESSION,
                prestige: CL.LOW,
                wealth: CL.NO_REGRESSION,
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher prestige and officer quality = more likely to succeed
        const successProbability = (planet.c.prestige + planet.c.education) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = planet.c.army > CL.MEDIUM && planet.c.wealth > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.EXPLORATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
