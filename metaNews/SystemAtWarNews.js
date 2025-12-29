class SystemAtWarNews extends News {
    static MIN_INITIAL_WARS = 2
    static MAX_INITIAL_WARS = 4
    static AVERAGE_ADDITIONAL_WARS_PER_YEAR = 0.5

    constructor() {
        super(
            ''+colorSpan(`${gs.system.name} ERUPTS INTO TOTAL WAR!`, COLORS.Red),
            ''+colorSpan(`${gs.system.name}'S TOTAL WAR ENDS!`, COLORS.Green),
            META_NT.SYSTEM_AT_WAR
        )

        this.startEffects = [
            new NewsEffect({
                onApply: ()=>{
                    console.log('starting world war')
                    const wars = SystemAtWarNews.getWarsToSpread(rng(SystemAtWarNews.MAX_INITIAL_WARS, SystemAtWarNews.MIN_INITIAL_WARS))
                    if (wars.length == 0) throw new Error('should not have been able to trigger system at war if no startable wars!')
                    for (const w of wars) w.start()
                }
            }),
        ]

        this.ongoingEffects = [
            new NewsEffect({
                onApply: (elapsedYears)=>{
                    console.log('world war tick')
                    const numWarsToStart = calcOccurrencesPerTimespan(SystemAtWarNews.AVERAGE_ADDITIONAL_WARS_PER_YEAR, elapsedYears)
                    if (numWarsToStart < 1) return
                    const wars = SystemAtWarNews.getWarsToSpread(numWarsToStart)
                    if (wars.length > 0) SimpleNews.add(''+colorSpan(`${gs.system.name}'S TOTAL WAR SPREADS!`, COLORS.Red))
                    for (const w of wars) w.start()
                }
            })
        ]


        this.completeEffects = [
            new NewsEffect({
                onApply: ()=>{
                    console.log('tearing down world war')
                    //end all endable wars in the system
                    const warNews = gs.system.news.filter(n=>(n.newsType == NT.WAR && !n.ended))
                    for (const wn of warNews) {
                        wn.endAsap = true
                        if (wn.shouldEnd()) wn.end()
                    }
                }
            })
        ]
    }

    isValid() {
        //at least 3 planets should be at war simultaneously
        const {planets} = gs.system
        const warCount = planets.reduce((count, planet) => {
            const hostilePlanets = Array.from(planet.culture.relationships.entries()).filter(([targetPlanet, relationship]) => relationship == RELATIONSHIP_TYPES.WAR)
            if (hostilePlanets.length >= 1) return count + 1
            return count
        }, 0)
        //should be able to start at least 3 more wars
        const possibleWars = SystemAtWarNews.getWarsToSpread(3)
        const preconditionsValid = warCount >= 3 && possibleWars.length >= 3
        const interferingNews = News.hasNews(META_NT.SYSTEM_AT_WAR)
        return preconditionsValid && !interferingNews

    }
    
    static getWarsToSpread(numWarsToStart = 1) {
        const {planets} = gs.system
        const planetsRandom1 = rndShuffle(planets)
        const planetsRandom2 = rndShuffle(planets)
        const warsToStart = []
        for (const planet of planetsRandom1) {
            for (const targetPlanet of planetsRandom2) {
                if (planet.culture.relationships.get(targetPlanet) == RELATIONSHIP_TYPES.TENSE) {
                    const news = new WarNews(planet, targetPlanet)
                    if (!news.isValid()) continue
                    //news.setDuration(1000) //dont expire naturally
                    warsToStart.push(news)
                    if (numWarsToStart-- <= 0) break
                }
            }
        }
        return warsToStart
    }
}