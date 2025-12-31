class WarOffensiveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a major naval offensive against ${coloredName(targetPlanet)}, relying on its generals to turn the tide!`,
            `${coloredName(planet)}'s brilliant naval offensive has wreaked havoc on ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s naval incursion was deftly enveloped and destroyed in detail by ${coloredName(targetPlanet)}! Losses were catastrophic!`,
            `${coloredName(planet)}'s naval offensive against ${coloredName(targetPlanet)} is cancelled! Peace treaty signed!`,
            NT.WAR_OFFENSIVE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                military: CL.SLIGHTLY_LOW,
                navy: CL.LOW
            },
            {
                navy: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW, //lose some control of shipping
            },
            {
                military: CL.SLIGHTLY_LOW,
                navy: CL.VERY_LOW
            },
        )

        this.addTargetPlanetEffect(
            {
                navy: CL.SLIGHTLY_LOW
            },
            {
                navy: CL.EXTREMELY_LOW,
                economy: CL.SLIGHTLY_LOW
            },
            {
                navy: CL.SLIGHTLY_LOW
            },
        )
    }

    determineOutcome() {
        //simple as
        return (this.planet.c.navy * this.planet.c.technology) / (this.targetPlanet.c.navy * this.targetPlanet.c.technology)
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // our navy must be at least comparable
        const ratingsValid = p.c.navy > CL.SLIGHTLY_LOW && p.c.navy > tp.c.navy
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, p, tp)
        return relationshipValid && ratingsValid && !interferingEvent
    }
}
