class WarInvasionNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches drop pods and begins a ground invasion of ${coloredName(targetPlanet)}!`,
            `The invasion of ${coloredName(targetPlanet)} concludes with heavy casualties!`,
            '',
            `${coloredName(planet)}'s invasion of ${coloredName(targetPlanet)} is called off! Ceasefire declared!`,
            NT.WAR_INVASION, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                education: CL.LOW,
            },
            {
                education: CL.NO_REGRESSION,
            },
            {},
            {}
        )

        this.addTargetPlanetEffect(
            {
                population: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_HIGH
            },
            {},
            {
                population: CL.SLIGHTLY_HIGH
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipsValid = Civilization.areAtWar(p, tp)
        // Attacker must have ship  AND ground advantage to launch invasion
        const militaryValid = (p.c.navy > tp.c.navy) && (p.c.army > tp.c.army)
        // Can't have invasion already
        const interferingEvent = News.hasNews(NT.WAR_INVASION, p, tp)
        return relationshipsValid && militaryValid && !interferingEvent
    }
}
