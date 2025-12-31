class WarOffensiveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a major offensive against ${coloredName(targetPlanet)}, relying on its generals!`,
            `${coloredName(planet)}'s brilliant offensive has wreaked havoc on ${coloredName(targetPlanet)}!`,
            '',
            `${coloredName(planet)}'s offensive against ${coloredName(targetPlanet)} is cancelled! Peace treaty signed!`,
            NT.WAR_OFFENSIVE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                military: CL.LOW,
            },
            {
                military: CL.SLIGHTLY_HIGH,
            },
            {},
            {}
        )

        this.addTargetPlanetEffect(
            {
                military: CL.SLIGHTLY_LOW,
            },
            {
                military: CL.SLIGHTLY_LOW,
            },
            {},
            {}
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        // Our officers must be better than theirs
        const advantage = p.c.education/tp.c.education >= CL.SLIGHTLY_HIGH
        // Can't have victory already
        const interferingEvent = News.hasNews(NT.WAR_OFFENSIVE, p, tp)
        return relationshipValid && advantage && !interferingEvent
    }
}
