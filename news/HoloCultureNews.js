class HoloCultureNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} has become the entertainment capital of the system, with its holovids neurally experienced everywhere!`,
            `${coloredName(planet)}'s entertainment industry thrives, spreading its culture throughout the system!`,
            `${coloredName(planet)}'s entertainment industry is plagued by scandals and corruption!`,
            '',
            NT.HOLO_CULTURE, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.HIGH,
                wealth: CL.HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.HOLOCUBES, CL.SLIGHTLY_LOW]
                ]))
            },
            {
                culture: CL.VERY_HIGH,
                wealth: CL.HIGH,
                taxes: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                onApply: ()=>this.onSuccess(),
            },
            {
                culture: CL.HIGH,
                wealth: CL.HIGH,
                prestige: CL.LOW,
                corruption: CL.SLIGHTLY_HIGH,
            }
        )
    }

    onSuccess() {
    }

    determineOutcome() {
        // Success based on culture and wealth
        this.rollOutcome(this.planet.c.culture * this.planet.c.wealth, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // More likely in culturally advanced, wealthy planets
        const ratingsValid = p.c.culture > CL.HIGH && p.c.wealth > CL.MEDIUM && p.c.economy > CL.SLIGHTLY_HIGH
        return ratingsValid
    }
}
