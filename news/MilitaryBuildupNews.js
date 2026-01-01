class MilitaryBuildupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive military buildup, converting some of its industry to military production!`,
            `${coloredName(planet)}'s military buildup is complete! They host a grand military parade that awes the system!`,
            `${coloredName(planet)}'s military buildup collapses due to corruption and economic constraints!`,
            ``,
            NT.MILITARY_BUILDUP, planet
        )

        this.addPlanetEffect(
            {
                reserves: CL.SLIGHTLY_LOW,
                industry: CL.LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.VERY_HIGH],
                    [CARGO_TYPES.ANTIMATTER, CL.ASTRONOMICAL]
                ]))
            },
            {
                industry: CL.LOW,
                army: CL.VERY_HIGH,
                navy: CL.VERY_HIGH,
                reserves: CL.LOW,
                taxes: CL.HIGH,
            },
            {
                reserves: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.taxes*this.planet.c.industry, CL.LOW)
    }
    isValid() {
        const {planet: p} = this
        //dont do it if military is already big
        const ratingsValid = (p.c.army < CL.HIGH)
        //dont do it if no government are tense with us or vice versa
        let politicsValid = Civilization.getPlanetsTenseOrAtWarWith(p).length > 0
        //removed most requirements for this, even juntas do this on a whim
        const interferingEvent = News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && politicsValid && !interferingEvent
    }
}
