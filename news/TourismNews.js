class TourismNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${planet.name} turns one of its moons into a resort to attract tourists from across the system!`,
            `${coloredName(planet)} completes its lunar resort, attracting a rush of lucrative tourism!`,
            `${coloredName(planet)}'s lunar resort project fails to attract tourists!`,
            ``,
            NT.TOURISM, planet
        )
        this.addPlanetEffect(
            {
                planet: this.planet,
                wealth: CL.LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.METAL, 2],
                    [CARGO_TYPES.NANITES, 2]
                ]))
            },
            {
                wealth: 1.5 / 0.7,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                wealth: CL.NO_REGRESSION,
                prestige: CL.LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Tourism succeeds unless planet has low prestige or poor economy
        this.rollOutcome(1 - (1 - p.c.prestige) * (1 - p.c.economy) * 0.3)
    }

    isValid() {
        const {planet: p} = this
        //more likely to try this out if we need money
        const ratingsValid = p.c.wealth < CL.LOW
        const interferingEvent = 
            News.planetHasAnyNews(planet, [NT.TOURISM, ...NT_ECONOMY_PREVENTING]) ||
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, NT_DANGEROUS) ||
            News.planetHasAnyNewsTargeting(planet, NT_DANGEROUS)
        return ratingsValid && !interferingEvent
    }
}
