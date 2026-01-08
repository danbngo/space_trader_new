class MinorResourceConcessionTreatyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} pressures ${coloredName(targetPlanet)} into signing a resource concession treaty, granting favorable access to their minerals and ores!`,
            `The resource concession treaty between ${coloredName(planet)} and ${coloredName(targetPlanet)} expires, having enriched both economies!`,
            ``,
            ``,
            NT.MINOR_RESOURCE_CONCESSION_TREATY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                wealth: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                reserves: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.SLIGHTLY_LOW],
                    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                wealth: CL.HIGH,
                economy: CL.HIGH,
                taxes: CL.LOW,
                reserves: CL.HIGH
            },
        )

        this.addTargetPlanetEffect(
            {
                wealth: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
            },
            {
                wealth: CL.HIGH,
                economy: CL.HIGH,
                industry: CL.LOW,
                reserves: CL.LOW,
                taxes: CL.LOW,
            },
        )

        // Slight culture transfer through economic ties
        this.completeEffects[0].onApply = () => {
            if (this.planet instanceof Planet && this.targetPlanet instanceof Planet) {
                this.targetPlanet.addCulture(this.planet, 0.03)
            }
        }
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // This event cannot fail - both sides benefit, though unequally
        // Target can resist slightly with army/prestige but ultimately must comply
        const {planet: p, targetPlanet: tp} = this
        const aggressorScore = (p.c.prestige * p.c.economy) * p.objectType.powerMultiplier
        const victimScore = (tp.c.army * tp.c.prestige) * tp.objectType.powerMultiplier
        
        // Heavy bias toward success - this is coercive diplomacy
        this.rollOutcome(aggressorScore / victimScore, CL.VERY_LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet must have stronger economy
        const economyValid = p.c.economy > tp.c.economy && p.c.wealth > CL.SLIGHTLY_LOW
        
        // Target must have resources worth extracting
        const targetValid = tp.c.industry > CL.SLIGHTLY_LOW || tp.settlement?.buildings?.some(b => b instanceof Market)
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_RESOURCE_CONCESSION_TREATY, NT.TRADE_AGREEMENT, NT.BLOCKADE])
        
        return economyValid && targetValid && relationshipsValid && !interferingEvent
    }
}
