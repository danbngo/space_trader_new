class ReligionHolyWarNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} declares a holy war against ${coloredName(targetPlanet)} in the name of ${colorSpan(planet.c.stateReligion?.name || 'their faith', planet.c.stateReligion?.color || COLORS.White)}!`,
            `${coloredName(planet)}'s holy crusade rallies co-religionists and turns ${coloredName(targetPlanet)} into a pariah!`,
            `${coloredName(planet)}'s holy war against ${coloredName(targetPlanet)} ends in failure and humiliation!`,
            `The holy war between ${coloredName(planet)} and ${coloredName(targetPlanet)} ends!`,
            NT.RELIGION_HOLY_WAR, planet, targetPlanet
        )

        this.addPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                prestige: CL.SLIGHTLY_HIGH,
                culture: CL.SLIGHTLY_HIGH,
            },
            {
                army: CL.LOW,
                prestige: CL.VERY_HIGH,
                culture: CL.HIGH,
            },
            {
                army: CL.VERY_LOW,
                prestige: CL.VERY_LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
            }
        )

        this.addTargetPlanetEffect(
            {
                army: CL.SLIGHTLY_LOW,
                economy: CL.SLIGHTLY_LOW,
            },
            {
                onApply: () => {
                    // Find co-religionist planets that can turn hostile to target
                    const [badNews] = News.calcRelationshipWorseningNews(targetPlanet)
                    const religiousAllies = badNews.filter(news => {
                        const otherPlanet = news.planet
                        // Filter for planets with same state religion that are neutral/allied with us
                        return otherPlanet.c.stateReligion === planet.c.stateReligion &&
                               Civilization.areAlliesOrNeutral(planet, otherPlanet)
                    })
                    
                    // Rally co-religionists to join the holy war
                    for (const news of religiousAllies) {
                        if (news.isValid()) {
                            news.start()
                        }
                    }
                    
                    // Give prestige boost to all co-religionists who joined
                    if (planet.c.stateReligion) {
                        for (const p of PLANETS) {
                            if (p !== planet && p !== targetPlanet && 
                                p.c.stateReligion === planet.c.stateReligion &&
                                (Civilization.areTenseOrAtWar(p, targetPlanet))) {
                                p.c.prestige *= CL.SLIGHTLY_HIGH
                            }
                        }
                    }
                    
                    // Target planet's religion shifts toward victor
                    if (planet.c.stateReligion) {
                        const currentAmount = targetPlanet.c.religions.getAmount(planet.c.stateReligion) || 0
                        targetPlanet.c.religions.setAmount(planet.c.stateReligion, currentAmount + 0.2)
                        targetPlanet.c.religions.normalize()
                    }
                },
                army: CL.SLIGHTLY_LOW,
                population: CL.SLIGHTLY_LOW,
                economy: CL.LOW,
                prestige: CL.LOW,
            },
            {
                army: CL.SLIGHTLY_LOW,
                prestige: CL.HIGH,
            },
            {
                army: CL.SLIGHTLY_LOW,
            }
        )
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        const {planet: p, targetPlanet: tp} = this
        // Find how many co-religionists could join the holy war
        const [possibleBadNews] = News.calcRelationshipWorseningNews(tp)
        const religiousAllies = possibleBadNews.filter(news => {
            const otherPlanet = news.planet
            return otherPlanet.c.stateReligion === p.c.stateReligion &&
                   Civilization.areAlliesOrNeutral(p, otherPlanet)
        })
        
        if (religiousAllies.length < 1) return
        
        // Success based on culture (religious fervor), army strength, and number of potential allies
        const allyBonus = 1 + (religiousAllies.length * 0.2)
        const aggressorScore = (p.c.culture * p.c.army * p.c.technology * allyBonus) * p.objectType.powerMultiplier
        const victimScore = (tp.c.army * tp.c.technology) * tp.objectType.powerMultiplier
        this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Requires state religion and religious differences
        const hasStateReligion = p.c.stateReligion !== null
        const differentReligions = p.c.stateReligion !== tp.c.stateReligion
        const relationshipsValid = Civilization.areTenseOrAtWar(p, tp)
        
        // Check if at least 1 co-religionist could be rallied
        const [badNews] = News.calcRelationshipWorseningNews(tp)
        const religiousAllies = badNews.filter(news => {
            const otherPlanet = news.planet
            return otherPlanet.c.stateReligion === p.c.stateReligion &&
                   Civilization.areAlliesOrNeutral(p, otherPlanet)
        })
        const canRallyAllies = religiousAllies.length >= 1
        
        const interferingEvent = News.hasNews(NT.RELIGION_HOLY_WAR, p, tp) || News.planetHasAnyNews(p, NT_WARLIKE)
        return hasStateReligion && differentReligions && relationshipsValid && canRallyAllies && !interferingEvent
    }
}
