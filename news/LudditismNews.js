class LudditismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} embraces a return-to-soil movement, rejecting advanced tech and industry for a simpler life!`,
            `${coloredName(planet)}'s people have completed their transition to a more pastoral life!`,
            `${coloredName(planet)}'s return-to-soil movement is forgotten as the planet's dissidents fight amongst themselves!`,
            ``,
            NT.LUDDITISM, planet
        )

        this.addPlanetEffect(
            {
                technology: CL.LOW,
                industry: CL.SLIGHTLY_LOW,
                commerce: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.NANITES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.EXTREMELY_LOW],
                    [CARGO_TYPES.HOLOCUBES, CL.VERY_LOW],
                    [CARGO_TYPES.ANTIMATTER, CL.VERY_LOW]
                ])),
            },
            {
                technology: CL.VERY_LOW,
                industry: CL.EXTREMELY_LOW,
                commerce: CL.LOW,
                inflation: CL.EXTREMELY_LOW,
                crime: CL.LOW,
                corruption: CL.LOW,
                army: CL.LOW,
                taxes: CL.LOW,
                culture: CL.HIGH,
                population: CL.HIGH
            },
            {
                culture: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        return Civilization.getPlanetsAtWarWith(this.planet).length > 0
    }

    determineOutcome() {
        //this is fairly hard to pull off
        this.rollOutcome((this.planet.c.industry*this.planet.c.culture*this.planet.c.technology*this.planet.c.economy), CL.HIGH)
    }

    isValid() {
        const {planet: p} = this
        //more likely if high tech and population pressure
        const ratingsValid = p.c.technology > CL.HIGH || p.c.industry > CL.HIGH
        //must not be at engaged in or targeted by any hostile acts
        const interferingEvent = News.planetHasAnyNews(p, NT_DANGEROUS) || News.planetHasAnyNewsTargeting(p, NT_DANGEROUS) 
        const peaceValid = Civilization.getPlanetsAtWarWith(p).length === 0
        return ratingsValid && !interferingEvent && peaceValid
    }
}
