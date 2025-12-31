class MilitaryBuildupNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins a massive military buildup!`,
            `${coloredName(planet)}'s military buildup is complete! They host a grand military parade!`,
            `${coloredName(planet)}'s military buildup collapses due to economic constraints!`,
            ``,
            NT.MILITARY_BUILDUP, planet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                reserves: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.VERY_HIGH],
                    [CARGO_TYPES.ANTIMATTER, 2]
                ]))
            },
            {
                army: CL.EXTREMELY_HIGH,
                mavy: CL.EXTREMELY_HIGH,
                education: CL.HIGH,
                wealth: CL.NO_REGRESSION,
            },
            {
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Buildup succeeds unless economy collapses during the process
        this.rollOutcome(p.c.economy * 0.65 + 0.35)
    }
    isValid() {
        const {planet: p} = this
        //dont do it if military is already big
        const ratingsValid = (p.c.army < CL.MEDIUM) && (p.c.prestige < CL.VERY_HIGH)
        //dont do it if no government are tense with us or vice versa
        let politicsValid = Civilization.getPlanetsTenseOrAtWarWith(p).length > 0
        //removed most requirements for this, even juntas do this on a whim
        const interferingEvent = News.planetHasAnyNews(p, [NT.MILITARY_BUILDUP]) 
        return ratingsValid && politicsValid && !interferingEvent
    }
}
