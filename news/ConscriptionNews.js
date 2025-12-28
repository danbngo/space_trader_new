class ConscriptionNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} institutes mandatory military conscription! Citizens are drafted en masse into the armed forces!`,
            `${coloredName(planet)}'s forced conscription program finally ends, but the economic damage lingers.`,
            `Mass riots force ${coloredName(planet)} to abandon conscription program!`,
            ``,
            NT.CONSCRIPTION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Military gains are kept, but economy/industry/prestige damage is permanent
        Object.assign(this.endEffects[0], {
            population: CL.NO_REGRESSION,
            military: CL.VERY_HIGH,
            economy: CL.NO_REGRESSION, // keep the damage
            industry: CL.NO_REGRESSION, // keep the damage
        })

        // Failed: riots force abandonment, no military gain
        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                population: News.clHalfRegression(CL.LOW), // some fled
                economy: CL.NO_REGRESSION, // damage done
                industry: CL.NO_REGRESSION,
                crime: CL.HIGH, // civil unrest
                prestige: CL.LOW, // policy failure
            })
        ]
    }

    determineEnding() {
        const {planet} = this
        // Conscription fails if population revolts (low security, high population)
        const revoltProbability = (1 - planet.culture.security) * (planet.culture.population) * 0.25
        this.failed = Math.random() < revoltProbability
    }

    isValid() {
        const {planet} = this
        // More likely if military is low or security is low (militarizing society)
        const ratingsValid = planet.culture.military < CL.LOW && planet.culture.population > CL.MEDIUM
        // Police states and authoritarian regimes would do this; not democracies or anarchies
        const govCheck = planet.culture.governmentType != GT.DEMOCRACY 
            && planet.culture.governmentType != GT.ANARCHY
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CONSCRIPTION])
        return ratingsValid && govCheck && !interferingEvent
    }
}
