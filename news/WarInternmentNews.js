class WarInternmentNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins interning citizens of ${coloredName(targetPlanet)} heritage, citing security concerns!`,
            `${coloredName(planet)}'s internment program concludes quietly, with the detainees released but the damage done!`,
            `Mass riots erupt on ${coloredName(planet)} as internment camps spark widespread unrest, forcing the program to collapse!`,
            `${coloredName(planet)} cancels its internment program as the war concludes!`,
            NT.WAR_INTERNMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                economy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                security: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_HIGH,
                population: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW,
                taxes: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
            },
            {
                security: CL.SLIGHTLY_LOW,
                crime: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_LOW,
                culture: CL.LOW,
            },
            {}
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // Must have significant population from targetPlanet culture
        return relationshipValid
    }
}
