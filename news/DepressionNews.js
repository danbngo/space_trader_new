class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} enters a Depression!`,
            `${coloredName(planet)} is stumbling out of its Depression!`,
            `${coloredName(planet)}'s Depression deepens! Economic collapse imminent!`,
            '',
            NT.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.EXTREMELY_LOW,
                stockpile: CL.EXTREMELY_LOW,
                economy: CL.EXTREMELY_LOW,
                industry: CL.VERY_LOW,
                credits: CL.EXTREMELY_LOW,
                crime: CL.HIGH,
                education: CL.HIGH,
                //crime: 0.7, -recession-proof industry
                corruption: CL.SLIGHTLY_LOW,
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.completeEffects[0], {
            credits: News.clHalfRegression(this.completeEffects[0].credits),
            stockpile: News.clHalfRegression(this.completeEffects[0].stockpile),
            inflation: News.clHalfRegression(this.completeEffects[0].inflation),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            corruption: (1 + this.completeEffects[0].corruption)/2,
            //crime: (1 + this.completeEffects[0].crime)/2,
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.NO_REGRESSION,
                stockpile: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                credits: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        // Higher industry and prestige = more likely to recover
        const recoveryProbability = (planet.civilization.industry + planet.civilization.prestige) / 2
        this.failed = Math.random() > recoveryProbability
    }

    isValid() {
        const {planet} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (planet.settlement.wealth) > CL.HIGH && planet.civilization.economy < CL.HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.DEPRESSION, ...NT_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
