class ExplorationNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches an exploration initiative to survey and claim small bodies across the system!`,
            `${coloredName(planet)}'s exploration mission succeeds, claiming new territories!`,
            NEWS_TYPES.EXPLORATION, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                guildNumOfficers: CL.VERY_LOW,
                marketCargoAmounts: CL.LOW,
                credits: CL.LOW,
            })
        ]

        //exploration pays off with territory and prestige
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        Object.assign(this.endEffects[0], {
            guildNumOfficers: CL.NO_REGRESSION, //officers don't auto return
            credits: News.clHalfRegression(this.endEffects[0].credits),
            marketCargoAmounts: News.clHalfRegression(this.endEffects[0].marketCargoAmounts),
            territory: CL.VERY_HIGH,
            prestige: CL.HIGH,
        })
    }

    isValid() {
        const {planet} = this
        const ratingsValid = planet.settlement.guild.baseNumOfficers > CL.MEDIUM && planet.settlement.bank.baseCredits/BANK_AVERAGE_CREDITS > CL.MEDIUM
        //basically don't do it if anything bad is happening
        const interferingEvent = 
            News.planetHasAnyNewsTargeting(planet, NEWS_TYPES_ECONOMY_PREVENTING) ||
            News.planetHasAnyNews(planet, [NEWS_TYPES.EXPLORATION, ...NEWS_TYPES_ECONOMY_PREVENTING]) 
        return ratingsValid && !interferingEvent
    }
}
