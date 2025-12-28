class CivilStrifeNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s people are rioting in the streets against their oppressive government!'`,
            `${coloredName(planet)}'s rioting is quelled!`,
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
                cargoPriceModifiers: new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]), //this is the only thing that normalizes after
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        //some lingering security and prestige decrease and destroyed goods
        Object.assign(this.endEffects[0], {
            prestige: CL.NO_REGRESSION,
            security: News.clHalfRegression(this.endEffects[0].security),
            economy: News.clHalfRegression(this.endEffects[0].economy),
            industry: News.clHalfRegression(this.endEffects[0].industry),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
        })
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
