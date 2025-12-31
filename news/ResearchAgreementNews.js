class ResearchAgreementNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} and ${coloredName(targetPlanet)} announce a joint research project!`,
            `${coloredName(planet)} and ${coloredName(targetPlanet)} conclude their joint research project!`,
            `Research collaboration between ${coloredName(planet)} and ${coloredName(targetPlanet)} yields no breakthroughs!`,
            `Tensions force ${coloredName(planet)} and ${coloredName(targetPlanet)} to abandon research collaboration!`,
            NT.RESEARCH_AGREEMENT, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                taxes: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))
            },
            {
                technology: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                taxes: CL.HIGH,
            },
        )

        this.addTargetPlanetEffect(
            {
                taxes: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.ISOTOPES, 2]]))  
            },
            {
                technology: CL.HIGH,
                education: CL.SLIGHTLY_HIGH,
                taxes: CL.SLIGHTLY_HIGH,
                prestige: CL.SLIGHTLY_HIGH
            },
            {
                taxes: CL.HIGH,
            },
        )
    }

    shouldCancel() {
        return Civilization.areTenseOrAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        this.rollOutcome(this.planet.c.education*this.targetPlanet.c.education*this.planet.c.taxes*this.targetPlanet.c.taxes/this.planet.c.technology/this.targetPlanet.c.technology, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        const relationshipsValid = Civilization.areAlliesOrNeutral(p, tp)
        //planets must have similar level of development
        const developmentValid = CL.HIGH > (p.c.education/tp.c.education) && (p.c.education/tp.c.education) > CL.LOW
        //removed most requirements for this
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, NT_COOPERATION_PREVENTING)
        return relationshipsValid && !interferingEvent && developmentValid
    }
}
