class SurveillanceNetworkNews extends News {
    constructor(planet = new Planet()) {
        super(
            `${coloredName(planet)}'s secret spying network against its citizens is uncovered by a whistleblower!`,
            `${coloredName(planet)} manages to distract the public and avoid any major consequences from its actions!`,
            `${coloredName(planet)}'s citizens rise up and demand the program be dismantled through legal and activist actions!`,
            ``,
            NT.SURVEILLANCE_NETWORK, planet
        )

        this.addPlanetEffect(
            {
                culture: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            },
            {
                security: CL.HIGH,
                corruption: CL.SLIGHTLY_HIGH
            },
            {
                culture: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p} = this
        // Success depends on security/corruption (authoritarianism) vs culture/education (civil liberties)
        this.rollOutcome(p.c.security * p.c.corruption / (p.c.culture * p.c.education), CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires high security (police state) and some technology for surveillance
        const ratingsValid = p.c.security > CL.SLIGHTLY_HIGH && p.c.technology > CL.SLIGHTLY_LOW
        
        // Can't have multiple surveillance/espionage events
        const interferingEvent = News.planetHasAnyNews(p, [NT.SURVEILLANCE_NETWORK, NT.CRACKDOWN, NT.TERRORISM])
        return ratingsValid && !interferingEvent
    }
}
