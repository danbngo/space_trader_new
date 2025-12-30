class EconomicBoomNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences an economic boom! Its citizens are living in a gilded age!`,
            `${coloredName(planet)}'s booming economy normalizes.`,
            `${coloredName(planet)}'s economic bubble bursts! Recession hits!`,
            '',
            NT.ECONOMIC_BOOM, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                civilizationMultipliers: new Civilization({
                    inflation: CL.VERY_LOW,
                    reserves: CL.VERY_HIGH,
                    crime: CL.VERY_HIGH,
                    economy: CL.EXTREMELY_HIGH,
                    industry: CL.VERY_HIGH,
                    wealth: CL.EXTREMELY_HIGH,
                    navy: CL.VERY_HIGH,
                    cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.HOLOCUBES, CL.EXTREMELY_HIGH]])),
                })
            })
        ]

        this.completeEffects = this.startEffects.map(effect => effect.getInverse())
        this.completeEffects[0].civilizationMultipliers.multiply(new Civilization({
            wealth: CL.SLIGHTLY_HIGH,
            economy: CL.SLIGHTLY_HIGH,
        }))

        this.failEffects = this.startEffects.map(effect => effect.getInverse())
        this.failEffects[0].civilizationMultipliers.multiply(new Civilization({
            inflation: CL.HIGH,
            reserves: CL.LOW,
            crime: CL.LOW,
            economy: CL.LOW,
            industry: CL.LOW,
            wealth: CL.VERY_LOW,
        }))
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.industry + this.planet.c.economy) / 2)
    }

    isValid() {
        const {planet: p} = this
        //cant already having a booming economy
        const ratingsValid = p.c.economy < CL.VERY_HIGH && p.c.wealth < CL.VERY_HIGH
        //basically just a bonus for not being in a war or anything stupid
        const interferingEvent = 
            News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNewsTargeting(p, [...NT_DANGEROUS, ...NT_ECONOMY_PREVENTING])
        return ratingsValid && !interferingEvent
    }
}
