class DepressionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s tenuous economy plunges into a Great Depression!`,
            `${coloredName(planet)} proactively mitigates its Depression, putting the populace to work!`,
            `${coloredName(planet)}'s economy is recovering sluggishly after allowing the Depression to reign unchecked!`,
            '',
            NT.DEPRESSION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.EXTREMELY_LOW,
                reserves: CL.EXTREMELY_LOW,
                economy: CL.EXTREMELY_LOW,
                industry: CL.VERY_LOW,
                wealth: CL.EXTREMELY_LOW,
                crime: CL.HIGH,
                education: CL.LOW, // workforce quality drops
                //crime: 0.7, -recession-proof industry
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())

        //some lingering price rate, cargo, commercial, and credit rate decreases
        Object.assign(this.completeEffects[0], {
            wealth: News.clHalfRegression(this.completeEffects[0].wealth),
            reserves: News.clHalfRegression(this.completeEffects[0].reserves),
            inflation: News.clHalfRegression(this.completeEffects[0].inflation),
            economy: News.clHalfRegression(this.completeEffects[0].economy),
            corruption: (1 + this.completeEffects[0].corruption)/2,
            //crime: (1 + this.completeEffects[0].crime)/2,
        })

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                inflation: CL.NO_REGRESSION,
                reserves: CL.NO_REGRESSION,
                economy: CL.NO_REGRESSION,
                industry: CL.NO_REGRESSION,
                wealth: CL.NO_REGRESSION,
                crime: CL.NO_REGRESSION,
                prestige: CL.VERY_LOW,
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        // Higher industry and prestige = more likely to recover
        const recoveryProbability = (p.c.industry + p.c.prestige) / 2
        this.failed = Math.random() > recoveryProbability
    }

    isValid() {
        const {planet: p} = this
        //more likely to happen when credit is REALLY high
        const ratingsValid = (p.c.wealth) > CL.HIGH && p.c.economy < CL.HIGH
        const interferingEvent =
            News.planetHasAnyNews(planet, [NT.DEPRESSION, ...NT_ECONOMY_BOOSTING]) || 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_BOOSTING)
        return ratingsValid && !interferingEvent
    }
}
