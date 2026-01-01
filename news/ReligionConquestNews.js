class ReligionConquestNews extends News {
    constructor(planet = new Planet()) {
        // Find a target planet with different religion
        const targetPlanet = rndMember(PLANETS.filter(p => 
            p !== planet &&
            p.c.stateReligion !== planet.c.stateReligion &&
            !Civilization.areAllies(planet, p)
        ))

        super(
            `${coloredName(planet)} rallies fellow ${coloredName(planet.c.stateReligion) || 'faithful'} worlds to oppose ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)} successfully convinces other planets of the faith to take action against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s religious coalition against ${coloredName(targetPlanet)} fails to materialize!`,
            ``,
            NT.RELIGION_CONQUEST, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_LOW,
                cargoPriceMultipliers: new CountsMap(new Map([[CARGO_TYPES.WEAPONS, CL.HIGH]])),
            },
            {
                prestige: CL.VERY_HIGH,
                culture: CL.HIGH,
            },
            {
                prestige: CL.LOW,
            }
        )

        this.addTargetPlanetEffect(
            {},
            {
                onApply: () => {
                    // Find planets with same religion as us that could turn hostile to target
                    const [badNews] = News.calcRelationshipWorseningNews(targetPlanet)
                    const religiousAllies = badNews.filter(news => {
                        // Filter for planets with same state religion that are neutral/allied with us
                        const otherPlanet = news.planet
                        return otherPlanet.c.stateReligion === planet.c.stateReligion &&
                               Civilization.areAlliesOrNeutral(planet, otherPlanet)
                    })
                    
                    // Start hostilities with those who share our faith
                    for (const news of religiousAllies) {
                        if (news.isValid()) news.start()
                    }
                }
            },
            {}
        )
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Find how many same-faith planets could turn hostile
        const [possibleBadNews] = News.calcRelationshipWorseningNews(tp)
        const religiousAllies = possibleBadNews.filter(news => {
            const otherPlanet = news.planet
            return otherPlanet.c.stateReligion === p.c.stateReligion &&
                   Civilization.areAlliesOrNeutral(p, otherPlanet)
        })
        
        if (religiousAllies.length < 2) return
        
        // Success based on culture (religious fervor) and prestige
        this.rollOutcome(p.c.culture * p.c.prestige / tp.c.prestige, CL.MEDIUM)
    }

    isValid() {
        const {planet: p} = this
        // Requires state religion and high culture
        const hasStateReligion = p.c.stateReligion !== null
        const ratingsValid = p.c.culture > CL.HIGH && p.c.prestige > CL.MEDIUM
        
        // Find potential target with different religion
        const potentialTargets = PLANETS.filter(target => 
            target !== p &&
            target.c.stateReligion !== p.c.stateReligion &&
            !Civilization.areAllies(p, target)
        )
        
        if (potentialTargets.length === 0) return false
        
        // Check if at least 2 same-faith planets could turn hostile to any target
        const hasReligiousCoalition = potentialTargets.some(target => {
            const [badNews] = News.calcRelationshipWorseningNews(target)
            const religiousAllies = badNews.filter(news => {
                const otherPlanet = news.planet
                return otherPlanet.c.stateReligion === p.c.stateReligion &&
                       Civilization.areAlliesOrNeutral(p, otherPlanet)
            })
            return religiousAllies.length >= 2
        })
        
        return hasStateReligion && ratingsValid && hasReligiousCoalition
    }
}
