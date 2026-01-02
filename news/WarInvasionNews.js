class WarInvasionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches drop pods and begins a ground invasion of ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} inflicts shock and awe on ${coloredName(targetPlanet)} with its ground assault!`,
            `${coloredName(planet)}'s ground invasion of ${coloredName(targetPlanet)} is repelled with heavy casualties!`,
            `${coloredName(planet)}'s invasion of ${coloredName(targetPlanet)} is called off! Ceasefire declared!`,
            NT.WAR_INVASION, planet, targetPlanet
        )

        const buildingsDamaged = rndMembers(targetPlanet.settlement.damagableBuildings, 1, true)

        this.addPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
            },
            {
                army: CL.VERY_LOW,
                navy: CL.SLIGHTLY_LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                population: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
                industry: CL.SLIGHTLY_LOW,
                territory: CL.SLIGHTLY_LOW
            },
            {
                buildingsDamaged,
                army: CL.LOW,
                population: CL.LOW,
                economy: CL.LOW,
                industry: CL.LOW,
                territory: CL.LOW,
                wealth: CL.LOW
            },
            {},
            {
                army: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.army*this.planet.c.technology/this.targetPlanet.c.army/this.targetPlanet.c.technology, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipsValid = Civilization.areAtWar(p, tp)
        // Attacker must have ship AND ground advantage to launch invasion
        const militaryValid = (p.c.navy > tp.c.navy) && (p.c.army > tp.c.army)
        // Cannot invade if target has active planetary defense platform
        const hasDefensePlatform = News.planetHasAnyNews(tp, [NT.PLANETARY_DEFENSE])
        return relationshipsValid && militaryValid && !hasDefensePlatform
    }
}
