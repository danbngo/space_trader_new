class ImmigrationNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)}'s wealth attracts a massive wave of immigration from ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s flood of immigration from ${coloredName(targetPlanet)} subsides.`,
            `${coloredName(planet)}'s economic downturn causes immigrants from ${coloredName(targetPlanet)} to return home!`,
            `Rising tensions force ${coloredName(planet)} to close borders to ${coloredName(targetPlanet)}!`,
            NT.IMMIGRATION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
            },
            {
                population: CL.HIGH,
                economy: CL.SLIGHTLY_HIGH,
            },
            {
                population: CL.SLIGHTLY_HIGH,
                economy: CL.LOW,
            },
            {
                population: CL.SLIGHTLY_HIGH,
                economy: CL.SLIGHTLY_HIGH,
            }
        )

        this.addTargetPlanetEffect(
            {
                population: CL.LOW,
            },
            {
                population: CL.LOW,
            },
            {
                population: CL.SLIGHTLY_LOW,
            },
            {
                population: CL.SLIGHTLY_LOW,
            }
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.economy)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Source must have population to give, target must have economic opportunity
        const ratingsValid = p.c.population < CL.HIGH && p.c.economy > CL.SLIGHTLY_HIGH && tp.c.population > CL.LOW
        // Must not be at war
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.IMMIGRATION]) || News.planetHasAnyNews(p, NT_ECONOMY_PREVENTING)
        return ratingsValid && relationshipsValid && !interferingEvent
    }
}