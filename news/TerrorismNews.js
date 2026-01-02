class TerrorismNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sponsors terrorist cells that strike at the heart of ${coloredName(targetPlanet)}, sowing fear and chaos!`,
            `${coloredName(targetPlanet)} successfully roots out the terrorist networks sponsored by ${coloredName(planet)}!`,
            `${coloredName(targetPlanet)} fails to stop the terrorism from ${coloredName(planet)}, even as their society succumbs to paranoia!`,
            `Peace between ${coloredName(planet)} and ${coloredName(targetPlanet)} ends the terrorist campaign!`,
            NT.TERRORISM, planet, targetPlanet
        )

        const buildingsDamaged = rndMembers(targetPlanet.settlement.damagableBuildings, 1, true)

        this.addPlanetEffect(
            {
                prestige: CL.VERY_LOW,
                wealth: CL.LOW,
                security: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.VERY_HIGH]]))
            },
            {
                prestige: CL.VERY_LOW,
                wealth: CL.LOW,
                security: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.VERY_LOW,
                wealth: CL.LOW,
                security: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.LOW,
                wealth: CL.LOW,
                security: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {
                buildingsDamaged,
                security: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ANTIMATTER, CL.HIGH]]))
            },
            {
                security: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
                crime: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW
            },
            {
                security: CL.HIGH,
                economy: CL.SLIGHTLY_LOW,
                culture: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            },
            {}
        )
    }

    shouldCancel() {
        return !Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {targetPlanet: tp, planet: p} = this
        // Success based on security, culture, and lack of corruption/crime
        this.rollOutcome(tp.c.security * tp.c.culture / tp.c.corruption / tp.c.crime / p.c.security, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Terrorist state must be weaker militarily than victim OR have low prestige, and victim must have lower security
        const militaryValid = (p.c.military < tp.c.military || p.c.prestige < CL.HIGH) && (tp.c.security < CL.SLIGHTLY_HIGH)
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        return militaryValid && relationshipsValid
    }
}
