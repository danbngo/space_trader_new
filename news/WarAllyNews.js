class WarAllyNews extends News {
    constructor(planet = new Planet(), targetPlanet = new Planet()) {
        super(
            `${coloredName(planet)} begins diplomatic efforts to convince its allies to join the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts lead to some of its allies joining the fight against ${coloredName(targetPlanet)}!`,
            `${coloredName(planet)}'s diplomatic efforts fail to secure its allies' commitment in the fight against ${coloredName(targetPlanet)}!`,
            `Peace between ${coloredName(planet)} and ${coloredName(targetPlanet)} renders alliance negotiations moot!`,
            NT.WAR_ALLY, planet, targetPlanet
        )
        
        this.addPlanetEffect({},
            {
                wealth: CL.LOW,
                prestige: CL.LOW,
            },
            {
                wealth: CL.LOW,
                prestige: CL.SLIGHTLY_LOW,
            },
            {
                wealth: CL.LOW,
                prestige: CL.LOW
            }
        )
        this.completeEffects[0].apply = ()=>{
            const pan = News.calcPotentialWarAlliesNews(this.planet, this.targetPlanet)
            const newsToApply = rndMembers(pan, rng(3,1))
            if (newsToApply.length > 0) {
                for (const n of newsToApply) n.start()
            }
        }
    }

    shouldCancel() {
        return !Civilization.areAtWar(this.planet, this.targetPlanet)
    }

    determineOutcome() {
        // Success probability based on prestige
        const pan = News.calcPotentialWarAlliesNews(this.planet, this.targetPlanet)
        if (pan.length == 0) {
            this.failed = true
        }
        else {
            const aggressorScore = this.planet.c.prestige * this.planet.objectType.powerMultiplier
            const victimScore = this.targetPlanet.c.prestige * this.targetPlanet.objectType.powerMultiplier
            this.rollOutcome(aggressorScore / victimScore, CL.MEDIUM)
        }
    }

    isValid() {
        const {planet: p, targetPlanet: tp} = this
        // Must be at war
        const relationshipsValid = Civilization.areAtWar(p, tp)
        const pan = News.calcPotentialWarAlliesNews(p, tp)
        if (pan.length === 0) return false
        // Must have high prestige to convince allies
        const prestigeValid = p.c.prestige > CL.MEDIUM
        // Can't have ally recruitment already
        return relationshipsValid && prestigeValid
    }
}
