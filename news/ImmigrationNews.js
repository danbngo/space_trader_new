class ImmigrationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s wealth attracts a massive wave of immigration from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s flood of immigration from ${coloredName(targetPlanet)} are successfully integrated into their new society!`,
            `${coloredName(planet)}'s society struggles to assimilate its immigrants from ${coloredName(targetPlanet)}! Tensions rise!`,
            `Rising tensions force ${coloredName(planet)} to close borders to ${coloredName(targetPlanet)}!`,
            NT.IMMIGRATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.HIGH,
                security: CL.SLIGHTLY_LOW,
            },
            {
                population: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
                industry: CL.HIGH,
            },
            {
                population: CL.HIGH,
                army: CL.SLIGHTLY_HIGH,
                security: CL.LOW,
                culture: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.LOW,
            },
            {
                population: CL.LOW,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                population: CL.LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.economy*this.planet.c.culture*this.planet.c.education*this.planet.c.wealth/this.planet.c.crime, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have population to give, target must have economic opportunity
        const ratingsValid = p.c.economy > CL.SLIGHTLY_HIGH && p.c.crime < CL.SLIGHTLY_HIGH && tp.c.population > CL.LOW
        // Must not be at war
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp) && p.c.economy/tp.c.economy > CL.HIGH
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.IMMIGRATION]) || News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}