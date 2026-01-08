class DiasporaReturnsNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} experiences a population boom as members of its diaspora return from across the system!`,
            `${coloredName(planet)}'s returning diaspora forms a harmonious whole with the existing population!`,
            `Tensions erupt on ${coloredName(planet)} between returning diaspora and existing residents, triggering social unrest!`,
            ``,
            NT.DIASPORA_RETURNS, planet
        )

        this.addPlanetEffect(
            {
                population: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                education: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.CONSTRUCTION, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                population: CL.HIGH,
                army: CL.SLIGHTLY_HIGH,
                culture: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.HIGH,
                culture: CL.LOW,
                security: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on culture, education, and lack of corruption/crime
        this.rollOutcome(p.c.culture * p.c.education / (p.c.corruption * p.c.crime), CL.SLIGHTLY_HIGH)
        
        // Apply SLIGHTLY_LOW population to every planet with this planet's culture above 5%
        for (const otherPlanet of [...gs.system.planets, ...gs.system.dwarfPlanets]) {
            if (otherPlanet === p || !otherPlanet.civilization || !otherPlanet.c.cultures) continue;
            
            const cultureAmount = otherPlanet.c.cultures.counts.get(p) || 0;
            if (cultureAmount > 0.05) {
                otherPlanet.c.population *= CL.SLIGHTLY_LOW;
                // Halve this planet's representation in their cultures map
                otherPlanet.c.cultures.increment(p, -cultureAmount * 0.5);
                otherPlanet.c.cultures.normalize();
            }
        }
    }

    isValid() {
        const {planet: p} = this
        // Must have high score and no dangerous events
        const ratingsValid = p.c.score > CL.MEDIUM && p.c.population < CL.HIGH
        
        // Require at least 2 other planets with 5% culture for this planet
        let planetsWithCulture = 0;
        for (const otherPlanet of [...gs.system.planets, ...gs.system.dwarfPlanets]) {
            if (otherPlanet === p || !otherPlanet.civilization || !otherPlanet.c.cultures) continue;
            const cultureAmount = otherPlanet.c.cultures.counts.get(p) || 0;
            if (cultureAmount > 0.05) planetsWithCulture++;
        }
        const cultureValid = planetsWithCulture >= 2;
        
        const interferingEvent = News.planetHasAnyNews(p, NT_DANGEROUS)
        return ratingsValid && cultureValid && !interferingEvent
    }
}
