class WarHumanWaveNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches desperate human wave attacks against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s human wave assault overwhelms ${coloredName(targetPlanet)}'s defenses, wreaking havoc!`,
            `${coloredName(planet)}'s human wave offensive is easily repelled by ${coloredName(targetPlanet)}'s defenses!`,
            `Peace treaty ends ${coloredName(planet)}'s human wave offensive before full deployment!`,
            NT.WAR_HUMAN_WAVE, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                population: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                population: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                population: CL.LOW,
                education: CL.SLIGHTLY_LOW,
                army: CL.SLIGHTLY_LOW
            },
            {
                population: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                army: CL.LOW,
                reserves: CL.LOW
            },
            {},
            {}
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        //it tends never to work based on what i've read
        this.rollOutcome(this.planet.c.population*this.planet.c.army / this.targetPlanet.c.army, CL.HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipsValid = Civilization.areAtWar(p, tp)
        const populationValid = p.c.population > CL.HIGH
        // we need to be desperate
        const militaryValid = p.c.military / tp.c.military < CL.LOW
        return relationshipsValid && populationValid && militaryValid
    }
}
