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
                army: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.MEDICINE, CL.EXTREMELY_HIGH]]))
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
                industry: CL.LOW,
                reserves: CL.LOW,
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
        const {planet: p, targetPlanet: tp} = this
        const aggressorScore = (p.c.population * p.c.army) * p.objectType.powerMultiplier
        const victimScore = tp.c.army * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.HIGH)
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
