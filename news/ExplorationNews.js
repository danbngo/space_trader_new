class ExplorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends out its best and brightest explorers to survey and claim small bodies in the kuiper belt!`,
            `${coloredName(planet)}'s exploration mission succeeds, claiming vast new territories!`,
            `${coloredName(planet)}'s exploration mission fails! Explorers lost in deep space!`,
            '',
            NT.EXPLORATION, planet
        )

        this.addEffect(
            {
                planet: this.planet,
                education: CL.LOW,
                reserves: CL.SLIGHTLY_LOW,
                technology: CL.LOW,
                navy: CL.SLIGHTLY_LOW,
                wealth: CL.LOW,
            },
            {
                education: CL.LOW,
                wealth: CL.SLIGHTLY_LOW,
                reserves: CL.SLIGHTLY_LOW,
                technology: CL.LOW,
                territory: CL.HIGH,
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                education: CL.LOW,
                technology: CL.LOW,
                prestige: CL.LOW,
                wealth: CL.LOW,
            }
        )
    }

    determineOutcome() {
        this.rollOutcome((this.planet.c.prestige + this.planet.c.education) / 2)
    }

    isValid() {
        const {planet: p} = this
        const ratingsValid = p.c.army > CL.MEDIUM && p.c.wealth > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.EXPLORATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
