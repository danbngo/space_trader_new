class DisasterAsteroidNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} is on an impending collision course with a large asteroid! Efforts to deflect or destroy it are underway!`,
            `${coloredName(planet)} successfully deflects the asteroid, saving the planet from catastrophe!`,
            `The asteroid strikes ${coloredName(planet)}, causing massive devastation across the surface!`,
            ``,
            NT.DISASTER_ASTEROID, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings, Math.min(5, this.planet.settlement.damagableBuildings.length), true);

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
            },
            {
                technology: CL.HIGH,
                navy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                buildingsDamaged: buildingsToDisable,
                population: CL.VERY_LOW,
                army: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                industry: CL.VERY_LOW,
                reserves: CL.VERY_LOW,
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on navy (deflection missions), technology (detection/calculation), and wealth (resources)
        this.rollOutcome(p.c.navy * p.c.technology * p.c.wealth / p.c.corruption, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        // Only affects planets with high asteroid impact frequency
        const climateValid = p.climate.asteroidImpact && p.climate.asteroidImpact.value >= ASTEROID_IMPACTS.SLIGHTLY_HIGH.value
        
        // Needs civilization to save
        const settlementValid = p.settlement && p.settlement.settlementType !== null
        return climateValid && settlementValid
    }
}
