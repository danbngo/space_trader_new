class FestivalNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} announces an extravagant festival open to all visitors, diverting resources to celebrate!`,
            `${coloredName(planet)}'s festival concludes, leaving the planet with enhanced prestige!`,
            `${coloredName(planet)}'s festival is marred by violence and disasters!`,
            ``,
            NT.FESTIVAL, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    wealth: CL.LOW,
                    economy: CL.LOW,
                    industry: CL.LOW,
                    reserves: CL.LOW,
                    crime: CL.HIGH,
                    corruption: CL.HIGH,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.VERY_HIGH], [CARGO_TYPES.DRUGS, CL.ASTRONOMICAL]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_LOW,
            reserves: CL.SLIGHTLY_LOW,
            crime: CL.SLIGHTLY_HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.LOW,
            economy: CL.LOW,
            crime: CL.HIGH,
            prestige: CL.LOW,
        }))
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.security)
    }

    isValid() {
        const {planet: p} = this
        //need high credits to afford it, low prestige to want it
        const ratingsValid = p.c.wealth > CL.SLIGHTLY_HIGH && p.c.prestige < CL.MEDIUM
        const interferingEvent = News.planetHasAnyNews(planet, [NT.FESTIVAL, ...NT_ECONOMY_PREVENTING, ...NT_DANGEROUS])
        return ratingsValid && !interferingEvent
    }
}
