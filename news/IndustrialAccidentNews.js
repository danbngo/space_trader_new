class IndustrialAccidentNews extends News {
    constructor(planet = new Planet()) {
        super(
            `A catastrophic industrial accident rocks ${coloredName(planet)}, triggering massive explosions that devastate entire districts!`,
            `${coloredName(planet)} successfully contains the damage through rapid response and technological expertise!`,
            `${coloredName(planet)}'s industrial disaster spirals out of control, causing widespread devastation!`,
            '',
            NT.INDUSTRIAL_ACCIDENT, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings);

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.HIGH], [CARGO_TYPES.WATER, CL.HIGH], [CARGO_TYPES.MEDICINE, CL.ASTRONOMICAL]])),
            },
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.VERY_LOW,
                reserves: CL.LOW,
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Can mitigate with technology, taxes (emergency funding), and reserves
        this.rollOutcome(p.c.technology * p.c.taxes * p.c.reserves, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely with very high industry and corruption (poor safety controls)
        const ratingsValid = p.c.industry > CL.VERY_HIGH && p.c.corruption > CL.MEDIUM
        
        // More likely on heavily polluted worlds with poor environmental controls
        const pollutionValid = p.features.includes(PLANET_FEATURE_TYPES.HEAVY_POLLUTION)
        
        return ratingsValid && pollutionValid
    }
}
