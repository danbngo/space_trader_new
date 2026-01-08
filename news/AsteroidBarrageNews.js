class AsteroidBarrageNews extends News {
    constructor(planet = new Planet()) {
        super(
            `A swarm of asteroids begins pummeling ${coloredName(planet)}, threatening infrastructure and lives!`,
            `${coloredName(planet)}'s navy successfully intercepts and redirects the asteroid barrage!`,
            `The asteroid barrage devastates ${coloredName(planet)}'s surface, destroying buildings and killing thousands!`,
            ``,
            NT.ASTEROID_BARRAGE, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, 1, true);

        this.addPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                taxes: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.ANTIMATTER, CL.VERY_HIGH],
                    [CARGO_TYPES.MEDICINE, CL.HIGH]
                ]))
            },
            {
                population: CL.SLIGHTLY_LOW,
                prestige: CL.HIGH,
                culture: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.LOW,
                army: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                wealth: CL.LOW,
                reserves: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on navy (interception) and reserves (ammunition/fuel)
        this.rollOutcome(p.c.navy * p.c.reserves * p.c.technology / p.c.corruption, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high asteroid impact frequency
        const climateValid = p.features.includes(PLANET_FEATURE_TYPES.ASTEROID_BOMBARDMENT)
        
        // Needs civilization
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        
        return climateValid && settlementValid
    }
}
