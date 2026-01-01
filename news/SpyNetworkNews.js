class SpyNetworkNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `Rumor has it that ${coloredName(planet)} has established a vast spy network in ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s operatives send massive data and state secrets back home, giving them a decisive military advantage!`,
            `${coloredName(planet)}'s operatives are arrested and imprisoned by ${coloredName(targetPlanet)}'s counter-intelligence service!`,
            ``,
            NT.SPY_NETWORK, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                wealth: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            },
            {
                technology: CL.HIGH,
                army: CL.SLIGHTLY_HIGH,
                navy: CL.SLIGHTLY_HIGH,
                security: CL.SLIGHTLY_HIGH
            },
            {
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                army: CL.SLIGHTLY_LOW,
                navy: CL.SLIGHTLY_LOW,
                security: CL.SLIGHTLY_LOW
            },
            {}
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on planet's technology/corruption vs target's security/technology
        this.rollOutcome(p.c.technology * p.c.corruption / (tp.c.security * tp.c.technology), CL.SLIGHTLY_HIGH)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must not be allies
        const relationshipsValid = !Civilization.areAllies(p, tp)
        
        // Planet needs technology and corruption for espionage
        const ratingsValid = p.c.technology > CL.SLIGHTLY_LOW && p.c.corruption > CL.SLIGHTLY_LOW && tp.c.security > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.SPY_NETWORK, NT.CYBER_WARFARE, NT.WAR_CODE_BREAK])
        return relationshipsValid && ratingsValid && !interferingEvent
    }
}
