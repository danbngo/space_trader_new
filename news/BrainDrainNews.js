class BrainDrainNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins losing its intellectuals to ${coloredName(targetPlanet)} as they flee to escape cultural and intellectual repression!`,
            `${coloredName(planet)} liberalizes some of its policies to retain its intellectuals, stemming the exodus!`,
            `${coloredName(planet)} hemorrhages smart people to ${coloredName(targetPlanet)}, devastating its intellectual and cultural foundations!`,
            ``,
            NT.BRAIN_DRAIN, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW
            },
            {
                culture: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            },
            {
                education: CL.HIGH,
                technology: CL.HIGH,
                culture: CL.HIGH
            }
        )

        this.addTargetPlanetEffect(
            {
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_HIGH],
                    [CARGO_TYPES.ELECTRONICS, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                education: CL.SLIGHTLY_LOW,
                technology: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW
            },
            {
                education: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW
            }
        )
        
        // Intellectuals bring their culture with them
        this.startEffects[0].onApply = () => {
            if (this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.02);
            }
        }
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on liberalization (low corruption, high culture/education)
        this.rollOutcome(p.c.culture * p.c.education / (p.c.corruption * p.c.security), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have intellectuals to lose
        const sourceValid = p.c.education > CL.SLIGHTLY_HIGH && p.c.technology > CL.SLIGHTLY_LOW
        
        // Target must be more free/attractive
        const targetValid = tp.c.education > CL.SLIGHTLY_LOW && tp.c.culture > p.c.culture
        
        // Must not be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.BRAIN_DRAIN]) || News.planetHasAnyNews(p, [NT.INDOCTRINATION_PROGRAM, NT.PHILOSOPHICAL_DEBATES, NT.KNOWLEDGE_CODEX])
        return sourceValid && targetValid && relationshipsValid && !interferingEvent
    }
}
