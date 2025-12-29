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
                officerQuality: CL.LOW,
                stockpile: CL.SLIGHTLY_LOW,
                shipQuality: CL.LOW,
                technology: CL.SLIGHTLY_LOW,
                credits: CL.LOW,
            })
        ]

        //exploration pays off with territory and prestige
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            education: CL.NO_REGRESSION, //officers don't auto return
            officerQuality: CL.NO_REGRESSION,
            credits: News.clHalfRegression(this.completeEffects[0].credits),
            stockpile: News.clHalfRegression(this.completeEffects[0].stockpile),
            //economy: CL.SLIGHTLY_HIGH,
            //industry: CL.SLIGHTLY_HIGH,
            shipQuality: CL.NO_REGRESSION,
            territory: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                education: CL.NO_REGRESSION,
                officerQuality: CL.NO_REGRESSION,
                shipQuality: CL.NO_REGRESSION,
                prestige: CL.LOW,
                credits: CL.NO_REGRESSION,
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher prestige and officer quality = more likely to succeed
        const successProbability = (planet.civilization.prestige + planet.civilization.officerQuality) / 2
        this.failed = Math.random() > successProbability
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.army > CL.MEDIUM && planet.settlement.wealth > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.EXPLORATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
