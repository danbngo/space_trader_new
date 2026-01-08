class DiplomaticRecognitionCrisisNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(targetPlanet)} declares independence from ${coloredName(planet)} and seeks international recognition as a sovereign state!`,
            `${coloredName(planet)} successfully pressures the international community to reject ${coloredName(targetPlanet)}'s independence claim!`,
            `${coloredName(targetPlanet)} gains international recognition and independence from ${coloredName(planet)}!`,
            ``,
            NT.DIPLOMATIC_RECOGNITION_CRISIS, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.LOW,
                territory: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([
                    [CARGO_TYPES.WEAPONS, CL.SLIGHTLY_HIGH]
                ]))
            },
            {
                prestige: CL.HIGH,
                territory: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.VERY_LOW,
                territory: CL.LOW,
            },
        )

        this.addTargetPlanetEffect(
            {
                prestige: CL.SLIGHTLY_HIGH,
            },
            {
                prestige: CL.LOW,
            },
            {
                prestige: CL.VERY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
        )

        // On failure (independence), end sovereign-subject relationship
        this.failEffects[0].onApply = () => {
            // Target gains independence - end subject-sovereign relationship
            this.planet.c.relationships.set(this.targetPlanet, RELATIONSHIP_TYPES.NEUTRAL)
            this.targetPlanet.c.relationships.set(this.planet, RELATIONSHIP_TYPES.NEUTRAL)
        }
    }

    shouldCancel() {
        // Cancel if relationship changes or war breaks out
        const relationship = this.targetPlanet.c.relationships.get(this.planet)
        return relationship !== RELATIONSHIP_TYPES.SUBJECT || Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet's ability to maintain control through international prestige and influence
        const sovereignScore = (p.c.prestige * p.c.culture * p.c.wealth) * p.objectType.powerMultiplier
        
        // Target's desire for independence and international sympathy
        const independenceScore = (tp.c.prestige * tp.c.culture) * tp.objectType.powerMultiplier
        
        // Bias toward planet keeping control (higher threshold for independence)
        this.rollOutcome(sovereignScore / independenceScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        
        // Planet must be sovereign of targetPlanet
        const isSovereign = tp.c.relationships.get(p) === RELATIONSHIP_TYPES.SUBJECT
        if (!isSovereign) return false
        
        // Target must have some prestige/culture to seek independence
        const targetValid = tp.c.prestige > CL.SLIGHTLY_LOW && tp.c.culture > CL.SLIGHTLY_LOW
        
        // Planet must have prestige worth defending
        const planetValid = p.c.prestige > CL.SLIGHTLY_LOW
        
        const interferingEvent = News.hasAnyNewsBidirectional(p, tp, [NT.DIPLOMATIC_RECOGNITION_CRISIS, NT.ANNEXATION_REFERENDUM, NT.CIVIL_WAR, NT.WAR])
        
        return targetValid && planetValid && !interferingEvent
    }
}
