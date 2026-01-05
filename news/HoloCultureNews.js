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
        // Spread culture to all other planets in the system
        if (this.planet && this.planet.civilization && this.planet.c.cultures) {
            const allPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations]
            
            for (const otherPlanet of allPlanets) {
                if (otherPlanet === this.planet || !otherPlanet.civilization) continue
                
                // Transfer culture from this planet to other planets (stronger than normal)
                this.planet.c.cultures.counts.forEach((amount, culture) => {
                    if (amount > 0 && otherPlanet.c.cultures) {
                        // Increase culture transfer - 0.5% instead of typical 0.1%
                        const transferAmount = amount * 0.005
                        otherPlanet.c.cultures.increment(culture, transferAmount)
                    }
                })
                
                // Normalize to keep percentages valid
                if (otherPlanet.c.cultures) {
                    otherPlanet.c.cultures.normalize()
                }
            }
        }
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
