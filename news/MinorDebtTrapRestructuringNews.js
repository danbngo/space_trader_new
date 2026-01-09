class MinorDebtTrapRestructuringNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} offers ${coloredName(targetPlanet)} generous loans and infrastructure investment, but the fine print grants significant control over their economy!`,
            `${coloredName(planet)}'s debt restructuring of ${coloredName(targetPlanet)} concludes, leaving lasting economic and political influence!`,
            ``,
            ``,
            NT.MINOR_DEBT_TRAP_RESTRUCTURING, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                wealth: CL.LOW,
                taxes: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
                economy: CL.HIGH,
                prestige: CL.HIGH,
                territory: CL.HIGH,
            },
        )

        this.addTargetPlanetEffect(
            {
                territory: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.HIGH,
                reserves: CL.VERY_HIGH,
                taxes: CL.VERY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.CONSTRUCTION, CL.HIGH],
                    [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                territory: CL.LOW,
                prestige: CL.LOW,
                economy: CL.HIGH,
                wealth: CL.VERY_HIGH,
                reserves: CL.HIGH,
                taxes: CL.LOW,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // This event always succeeds - it's about the degree of control gained
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet must have wealth to invest
        const investorValid = p.c.wealth > CL.MEDIUM && p.c.economy > CL.MEDIUM
        
        // Target must need investment (poor economy or low reserves)
        const targetValid = (tp.c.economy < CL.MEDIUM || tp.c.reserves < CL.MEDIUM) && tp.c.wealth < CL.HIGH
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_DEBT_TRAP_RESTRUCTURING, NT.INVESTMENT, NT.FOREIGN_AID, NT.BLOCKADE])
        
        return investorValid && targetValid && relationshipsValid && !interferingEvent
    }
}
