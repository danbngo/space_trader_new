class EnvironmentalDisasterNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s polluting has led to environmental disaster! Efforts to reverse climate change are underway!`,
            `${coloredName(planet)} has reversed the climate change afflicting their planet! The planet is sparkling!`,
            `${coloredName(planet)}'s efforts to reverse climate change fail, leaving the planet permanently scarred!`,
            ``,
            NT.ENVIRONMENTAL_DISASTER, planet
        )

        const buildingsToDisable = rndMembers(this.planet.settlement.damagableBuildings);

        this.addPlanetEffect(
            {
                industry: CL.LOW,
                reserves: CL.LOW,
                economy: CL.LOW,
                population: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.HIGH], [CARGO_TYPES.WATER, CL.ASTRONOMICAL], [CARGO_TYPES.MEDICINE, CL.HIGH]])),
            },
            {
                culture: CL.HIGH,
                corruption: CL.SLIGHTLY_LOW,
            },
            {
                buildingsDamaged: buildingsToDisable,
                industry: CL.VERY_LOW,
                reserves: CL.LOW,
                population: CL.LOW,
                economy: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        this.rollOutcome((p.c.technology + p.c.education + p.c.culture + p.c.taxes) / 4, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p} = this
        //happens when industry is getting out of hand
        const ratingsValid = p.c.industry >= CL.HIGH
        return ratingsValid
    }
}
