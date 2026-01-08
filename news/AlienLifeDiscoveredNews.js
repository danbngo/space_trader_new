class AlienLifeDiscoveredNews extends News {
    constructor(planet = new Planet()) {
        // Select a random moon from this planet's system
        let moonName = "one of its moons"
        if (planet.children && planet.children.length > 0) {
            const randomMoon = rndMember(planet.children)
            moonName = randomMoon.name
        }
        
        super(
            `Scientists on ${coloredName(planet)} have detected signs of microbial life on ${moonName}, the first confirmed extraterrestrial organisms ever discovered!`,
            `After years of meticulous study, researchers on ${coloredName(planet)} have successfully analyzed the alien microbes from ${moonName}. The organisms reveal entirely new biochemical pathways, revolutionizing biology, medicine, and biotechnology. ${coloredName(planet)} becomes the scientific center of the known galaxy!`,
            `After years of research, disaster strikes on ${coloredName(planet)}'s ${moonName} research station. Containment fails, samples are contaminated with terrestrial microbes, and the alien organisms are lost forever. The scientific community mourns the greatest missed opportunity in history!`,
            ``,
            NT.ALIEN_LIFE_DISCOVERED, planet
        )
        
        this.moonName = moonName

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.MEDICINE, CL.HIGH],
                    [CARGO_TYPES.NANITES, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                prestige: CL.VERY_HIGH,
                technology: CL.HIGH,
                education: CL.HIGH,
                industry: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH
            },
            {
                prestige: CL.HIGH,
                wealth: CL.HIGH
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success factors: high technology, high education, high culture (careful handling)
        this.rollOutcome(p.c.technology * p.c.education * p.c.culture, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Requires at least one moon
        if (!p.children || p.children.length === 0) return false;
        
        // Requires technology and education
        if (p.c.technology < CL.SLIGHTLY_LOW) return false;
        if (p.c.education < CL.SLIGHTLY_LOW) return false;
        
        // Can't have multiple exploration megaprojects
        if (News.planetHasAnyNews(p, [NT.EXPLORATION, NT.ARTIFACTS_DISCOVERED, NT.ALIEN_LIFE_DISCOVERED, NT.RUINS_DISCOVERED])) return false;
        
        return true;
    }
}
