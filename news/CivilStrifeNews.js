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
                civilizationMultipliers: new Civilization({
                    army: CL.SLIGHTLY_LOW,
                    security: CL.VERY_LOW,
                    economy: CL.LOW,
                    industry: CL.VERY_LOW,
                    wealth: CL.LOW,
                    reserves: CL.LOW,
                    prestige: CL.SLIGHTLY_LOW,
                    crime: CL.HIGH,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]])),
                })

            })
        ]
        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.completeEffects[0], {
            culture: CL.HIGH
        })
        //some lingering security and prestige decrease and destroyed goods

        this.failEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    army: CL.NO_REGRESSION,
                    security: CL.LOW/CL.VERY_LOW,
                    crime: CL.SLIGHTLY_HIGH/CL.HIGH,
                    prestige: CL.LOW/CL.SLIGHTLY_LOW,
                    culture: CL.LOW,
                    corruption: CL.SLIGHTLY_HIGH,
                })
            })
        ]
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome(p.c.prestige*p.c.security*p.c.culture, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        //more likely if security is too high, prestige or culture are too low
        const ratingsValid = p.c.security > CL.HIGH || p.c.culture < CL.LOW || p.c.prestige < CL.LOW
        //planet must not already be in anarchy or puppet state
        const interferingEvent = News.planetHasAnyNews(p, NT_GOVERNANCE_PREVENTING)
        return ratingsValid && !interferingEvent
    }
}
