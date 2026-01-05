class GunboatDiplomacyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} sends a flotilla to open trade with ${coloredName(targetPlanet)} and achieve more favorable terms, with an implied threat!`,
            `${coloredName(targetPlanet)} opens its markets to avoid a confrontation with ${coloredName(planet)}'s warships!`,
            `${coloredName(targetPlanet)} is unintimidated by ${coloredName(planet)}'s gunboat diplomacy and harasses the ships until they're forced to leave!`,
            ``,
            NT.GUNBOAT_DIPLOMACY, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_LOW
            },
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_HIGH
            },
            {
                navy: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_LOW
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                economy: CL.SLIGHTLY_HIGH,
                wealth: CL.SLIGHTLY_LOW,
                corruption: CL.SLIGHTLY_LOW
            },
            {}
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Success depends on attacker's navy/army vs target's navy/army
        const aggressorScore = (p.c.navy * p.c.army) * p.objectType.powerMultiplier
        const victimScore = (tp.c.navy * tp.c.army) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must not be at war or allies
        const relationshipsValid = !Civilization.areAtWar(p, tp) && !Civilization.areAllies(p, tp)
        
        // Attacker needs navy, target needs economy worth opening
        const ratingsValid = p.c.navy > CL.SLIGHTLY_HIGH && tp.c.economy > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.GUNBOAT_DIPLOMACY, NT.BLOCKADE, NT.TRADE_AGREEMENT])
        return relationshipsValid && ratingsValid && !interferingEvent
    }
}
