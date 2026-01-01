class PropagandaCampaignNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} launches a propaganda campaign against ${coloredName(targetPlanet)}, seeking to undermine their reputation in the interplanetary community!`,
            `${coloredName(targetPlanet)} is viewed with suspicion and hate by other planets in the wake of ${coloredName(planet)}'s propaganda campaign!`,
            `${coloredName(targetPlanet)} successfully counters ${coloredName(planet)}'s propaganda with their own!`,
            ``,
            NT.PROPAGANDA_CAMPAIGN, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                wealth: CL.SLIGHTLY_LOW,
                culture: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                prestige: CL.SLIGHTLY_LOW
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on attacker's culture/corruption vs target's culture/prestige
        this.rollOutcome(p.c.culture * p.c.corruption / (tp.c.culture * tp.c.prestige), CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must not be allies
        const relationshipsValid = !Civilization.areAllies(p, tp)
        
        // Both need sufficient development to wage propaganda war
        const ratingsValid = p.c.culture > CL.SLIGHTLY_LOW && tp.c.prestige > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.PROPAGANDA_CAMPAIGN])
        return relationshipsValid && ratingsValid && !interferingEvent
    }
}
