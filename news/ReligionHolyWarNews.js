class ReligionHolyWarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares a holy war against ${coloredName(targetPlanet)} in the name of ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)}!`,
            `${coloredName(planet)}'s holy crusade conquers ${coloredName(targetPlanet)} with support from co-religionists!`,
            `${coloredName(planet)}'s holy war against ${coloredName(targetPlanet)} ends in failure and humiliation!`,
            `The holy war between ${coloredName(planet)} and ${coloredName(targetPlanet)} ends!`,
            NT.RELIGION_HOLY_WAR, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                army: CL.LOW,
                prestige: CL.VERY_HIGH,
                territory: CL.SLIGHTLY_HIGH,
            },
            {
                army: CL.VERY_LOW,
                prestige: CL.VERY_LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
            },
            {
                onApply: () => {
                    // If co-religionists exist, they gain prestige
                    if (planet.c.stateReligion) {
                        for (const p of PLANETS) {
                            if (p !== planet && p !== targetPlanet && p.c.stateReligion === planet.c.stateReligion) {
                                p.c.prestige *= CL.SLIGHTLY_HIGH
                            }
                        }
                    }
                    // Target planet's religion shifts toward victor
                    if (planet.c.stateReligion) {
                        const currentAmount = targetPlanet.c.religions.getAmount(planet.c.stateReligion) || 0
                        targetPlanet.c.religions.setAmount(planet.c.stateReligion, currentAmount + 0.2)
                        targetPlanet.c.religions.normalize()
                    }
                },
                army: CL.LOW,
                population: CL.LOW,
                territory: CL.LOW,
                prestige: CL.LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
                prestige: CL.HIGH,
            },
            {
                army: CL.SLIGHTLY_LOW,
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Holy wars get bonus from co-religionists
        let coReligionistBonus = 1.0
        if (p.c.stateReligion) {
            for (const other of PLANETS) {
                if (other !== p && other !== tp && other.c.stateReligion === p.c.stateReligion) {
                    coReligionistBonus += 0.2
                }
            }
        }
        this.rollOutcome(p.c.army * p.c.technology * coReligionistBonus / tp.c.army / tp.c.technology, CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Requires state religion and religious differences
        const hasStateReligion = p.c.stateReligion !== null
        const differentReligions = p.c.stateReligion !== tp.c.stateReligion
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        const interferingEvent = News.hasNews(NT.RELIGION_HOLY_WAR, p, tp) || News.planetHasAnyNews(p, NT_WARLIKE)
        return hasStateReligion && differentReligions && relationshipsValid && !interferingEvent
    }
}
