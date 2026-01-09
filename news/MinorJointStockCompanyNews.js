class MinorJointStockCompanyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} establishes a joint-stock company to administer ${coloredName(targetPlanet)}, bringing corporate efficiency and extracting wealth!`,
            `${coloredName(planet)}'s joint-stock company completes its charter in ${coloredName(targetPlanet)}, leaving a legacy of corporate governance!`,
            ``,
            ``,
            NT.MINOR_JOINT_STOCK_COMPANY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                economy: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
                taxes: CL.LOW,
                reserves: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW],
                    [CARGO_TYPES.METAL, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                economy: CL.HIGH, // Reduced from VERY_HIGH
                prestige: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                territory: CL.SLIGHTLY_HIGH, // Reduced from HIGH
                taxes: CL.LOW,
                reserves: CL.HIGH,
            },
        )

        this.addTargetPlanetEffect(
            {
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW,
                taxes: CL.LOW,
                reserves: CL.HIGH,
                newGovernmentType: GT.CORPORATISM,
            },
            {
                economy: CL.HIGH,
                prestige: CL.LOW,
                territory: CL.LOW,
                taxes: CL.LOW,
                reserves: CL.HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areAtWar(this.planet, this.targetPlanet) || this.planet.c.governmentType === GT.COMMUNISM
    }

    determineOutcome() {
        // This event always succeeds - corporate administration is established
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet must not be communist
        const govValid = p.c.governmentType !== GT.COMMUNISM && p.c.governmentType !== GT.ANARCHY
        
        // Planet must have strong economy and preferably corporatist
        const economyValid = p.c.economy > CL.MEDIUM && (p.c.governmentType === GT.CORPORATISM || p.c.wealth > CL.HIGH)
        
        // Target must not already be corporatist or too wealthy/independent
        const targetValid = tp.c.governmentType !== GT.CORPORATISM && tp.c.economy < CL.HIGH
        
        // Cannot be at war
        const relationshipsValid = !Civilization.areAtWar(p, tp)
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.MINOR_JOINT_STOCK_COMPANY, NT.COUP_DETAT, NT.REVOLUTION])
        
        return govValid && economyValid && targetValid && relationshipsValid && !interferingEvent
    }
}
