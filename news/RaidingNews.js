class RaidingNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} launches raids on neighboring settlements! Plundered goods flood their markets!`,
            `${coloredName(planet)} ceases its raiding operations, but military readiness has been compromised.`,
            NEWS_TYPES.RAIDING, planet
        )

        this.startEffects = [
            new NewsEffect({
                planet: this.planet,
                marketCargoAmounts: 1.8,
                blackMarketCargoAmounts: 2.0,
                commerce: 1.3,
                military: 0.8, // diverting forces to raiding weakens defense
            })
        ]
        this.endEffects = this.startEffects.map(effect => effect.getInverse())
        // Market goods normalize back, but commerce gains, military loss, and prestige damage are permanent
        Object.assign(this.endEffects[0], {
            marketCargoAmounts: 1, // normalize back
            blackMarketCargoAmounts: 1, // normalize back
            commerce: 1, // keep the gains
            military: 1, // keep the damage
            prestige: 0.8, // permanent prestige loss (piracy is dishonorable)
        })
    }

    isValid() {
        const {planet} = this
        // More likely if commerce is low and crime is high (desperate/lawless)
        const ratingsValid = planet.culture.commerce < 0.5 && planet.culture.crime > 0.6
        // Anarchies, pirate havens, and weak governments would raid
        // Corporate states and police states would not (too organized/legitimate)
        const govCheck = planet.culture.governmentType == GOVERNMENT_TYPES.ANARCHY
            || planet.culture.governmentType == GOVERNMENT_TYPES.WEAK
            || planet.culture.crime > 0.7 // high crime overrides government check
        // Planet must not already have this event
        const interferingEvent = News.planetHasAnyNews(planet, [NEWS_TYPES.RAIDING])
        return ratingsValid && govCheck && !interferingEvent
    }
}
