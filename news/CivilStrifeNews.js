class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are rioting in the streets against their oppressive government!'`,
            `${coloredName(planet)}'s rioting is quelled as the government soothes the concerns of its citizens!`,
            `${coloredName(planet)} fails to stop the riots and is forced to put them down with force!`,
            '',
            NT.CIVIL_STRIFE, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.SLIGHTLY_LOW,
                security: CL.VERY_LOW,
                crime: CL.HIGH,
                economy: CL.LOW,
                industry: CL.VERY_LOW,
                credits: CL.LOW,
                marketCargoAmounts: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]),
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods

        this.failEndEffects = [
            new NewsEffect({
                planet: this.planet,
                military: CL.NO_REGRESSION,
                security: News.clHalfRegression(this.endEffects[0].security),
                crime: News.clHalfRegression(this.endEffects[0].crime),
                prestige: CL.NO_REGRESSION,
            })
        ]
    }

    determineOutcome() {
        const {planet} = this
        this.rollOutcome(planet.culture.military*planet.culture.security, CL.MEDIUM)
    }

    isValid() {
        const {planet} = this
        //more likely if security is too high
        const ratingsValid = planet.culture.security > CL.HIGH
        //planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(planet, [NT.CIVIL_STRIFE, NT.CIVIL_WAR, NT.REVOLUTION])
        return ratingsValid && !interferingEvent
    }
}
