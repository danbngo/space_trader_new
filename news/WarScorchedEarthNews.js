class WarScorchedEarthNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} adopts a scorched earth policy, destroying territory to blunt ${coloredName(targetPlanet)}'s advance!`,
            `${coloredName(planet)}'s scorched earth campaign causes ${coloredName(targetPlanet)}'s forces to suffer massive losses from attrition!`,
            `${coloredName(planet)}'s scorched earth campaign fails as ${coloredName(targetPlanet)}'s forces are too well-supplied!`,
            `Peace treaty halts ${coloredName(planet)}'s scorched earth policy mid-execution!`,
            NT.WAR_SCORCHED_EARTH, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                territory: CL.LOW,
                industry: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.FOOD, CL.EXTREMELY_HIGH], [CARGO_TYPES.WATER, CL.EXTREMELY_HIGH]]))
            },
            {
                territory: CL.LOW,
                industry: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
            },
            {
                territory: CL.LOW,
                industry: CL.LOW,
                economy: CL.SLIGHTLY_LOW,
            },
            {
                territory: CL.LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
            },
            {
                army: CL.VERY_LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
            },
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        const aggressorScore = (p.c.territory * p.c.army) * p.objectType.powerMultiplier
        const victimScore = (tp.c.military * tp.c.economy) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.LOW)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipValid = Civilization.areAtWar(p, tp)
        const territoryValid = p.c.territory > CL.HIGH
        // we need to be desperate
        const militaryValid = p.c.military/tp.c.military < CL.SLIGHTLY_LOW
        return militaryValid && relationshipValid && territoryValid
    }
}
