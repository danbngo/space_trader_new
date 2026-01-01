class PlanetaryDefenseNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} begins construction of an orbital defense platform to protect against hostile fleets!`,
            `${coloredName(planet)}'s orbital defense platform is now operational, rendering the planet nearly impervious to invasion!`,
            ``, // No failure - long duration event
            `${coloredName(planet)}'s orbital defense platform becomes obsolete due to technological advances and is decommissioned!`,
            NT.PLANETARY_DEFENSE, planet
        )

        this.addPlanetEffect(
            {
                taxes: CL.VERY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                inflation: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, CL.VERY_HIGH],
                    [CARGO_TYPES.NANITES, CL.HIGH],
                    [CARGO_TYPES.ANTIMATTER, CL.HIGH]
                ]))
            },
            {
                taxes: CL.HIGH,
                navy: CL.HIGH,
                security: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                technology: CL.SLIGHTLY_HIGH
            },
            {},
            {
                navy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        // Always succeeds - this is a long-term project that completes
    }

    isValid() {
        const {planet: p} = this
        // Requires decent tech, military, and resources
        const ratingsValid = p.c.technology > CL.SLIGHTLY_HIGH 
            && p.c.navy > CL.SLIGHTLY_HIGH
            && p.c.wealth > CL.SLIGHTLY_HIGH
            && p.c.reserves > CL.SLIGHTLY_LOW
        return ratingsValid
    }
}
