class ExplorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} sends out its best and brightest explorers to survey and claim small bodies in the kuiper belt!`,
            `${coloredName(planet)}'s exploration mission succeeds, claiming vast new territories!`,
            NT.EXPLORATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                guildNumOfficers: CL.LOW,
                officerQuality: CL.LOW,
                marketCargoAmounts: CL.SLIGHTLY_LOW,
                shipQuality: CL.LOW,
                shipyardNumShips: CL.SLIGHTLY_LOW,
                credits: CL.LOW,
            })
        ]

        //exploration pays off with territory and prestige
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            guildNumOfficers: CL.NO_REGRESSION, //officers don't auto return
            officerQuality: CL.NO_REGRESSION,
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            //economy: CL.SLIGHTLY_HIGH,
            //industry: CL.SLIGHTLY_HIGH,
            shipQuality: CL.NO_REGRESSION,
            territory: CL.HIGH,
            prestige: CL.SLIGHTLY_HIGH,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.settlement.guild.baseNumOfficers > CL.MEDIUM && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NT_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NT.EXPLORATION, ...NT_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
