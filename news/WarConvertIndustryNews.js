class WarConvertIndustryNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)} converts its civilian industries to military production! Factories now produce arms, ammunition, and warships!`,
            ``,
            ``,
            `${coloredName(planet)}'s military-industrial complex continues to churn out weapons of war!`,
            NT.WAR_CONVERT_INDUSTRY, planet
        )

        this.addPlanetEffect(
            {
                industry: CL.HIGH,
                economy: CL.MEDIUM,
                culture: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_HIGH,
                army: CL.SLIGHTLY_HIGH
            },
            {},
            {}
        )
    }

    determineOutcome() {
        // This event cannot fail - it's a strategic decision
    }

    isValid() {
        const {planet: p} = this
        // Requires medium industry and economy to convert
        const ratingsValid = p.c.industry >= CL.MEDIUM && p.c.economy >= CL.MEDIUM
        
        // Must be at war
        const atWar = Civilization.getPlanetsAtWarWith(p).length > 0
        
        // Can't already be doing this
        const interferingEvent = News.planetHasAnyNews(p, [NT.WAR_CONVERT_INDUSTRY])
        return ratingsValid && atWar && !interferingEvent
    }
}
