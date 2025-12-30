class SystemWidePlague extends News {
    static MIN_INITIAL_PLAGUES = 2
    static MAX_INITIAL_PLAGUES = 4
    static AVERAGE_ADDITIONAL_PLAGUES_PER_YEAR = 0.5

    constructor() {
        super(
            ''+colorSpan(`${gs.system.name} ERUPTS INTO A SYSTEM-WIDE PLAGUE!`, COLORS.Red),
            ''+colorSpan(`${gs.system.name}'S SYSTEM-WIDE PLAGUE ENDS!`, COLORS.Green),
            '',
            '',
            META_NT.SYSTEM_WIDE_PLAGUE
        )

        this.startEffects = [
            new NewsEffect({
                onApply: ()=>{
                    const plagues = SystemWidePlague.getPlaguesToSpread(rng(SystemWidePlague.MIN_INITIAL_PLAGUES, SystemWidePlague.MAX_INITIAL_PLAGUES, true))
                    if (plagues.length == 0) throw new Error('should not have been able to trigger system-wide plague if no startable plagues!')
                    for (const p of plagues) p.start()
                }
            }),
        ]

        this.onTick = (elapsedYears)=>{
            const numPlaguesToStart = calcOccurrencesPerTimespan(SystemWidePlague.AVERAGE_ADDITIONAL_PLAGUES_PER_YEAR, elapsedYears)
            if (numPlaguesToStart < 1) return
            const plagues = SystemWidePlague.getPlaguesToSpread(numPlaguesToStart)
            if (plagues.length > 0) SimpleNews.add(''+colorSpan(`${gs.system.name}'S SYSTEM-WIDE PLAGUE SPREADS!`, COLORS.Red))
            for (const p of plagues) p.start()
        }

        this.completeEffects = [
            new NewsEffect({
                onApply: ()=>{
                    //end all endable plagues in the system
                    const plagueNews = gs.system.news.filter(n=>(n.newsType == NT.PLAGUE && !n.ended))
                    for (const pn of plagueNews) {
                        pn.endAsap = true
                        if (pn.shouldEnd()) pn.end()
                    }
                }
            })
        ]
    }

    isValid() {
        //at least 1 planets should be infected simultaneously
        const plagueNews = News.getNews(NT.PLAGUE)
        const preconditionsValid = plagueNews.length >= 1
        const interferingNews = News.hasNews(META_NT.SYSTEM_WIDE_PLAGUE)
        //should be able to spread to at least 3 more
        const possiblePlagues = SystemWidePlague.getPlaguesToSpread(3)
        return preconditionsValid && !interferingNews && (possiblePlagues.length >=3)
    }

    static getPlaguesToSpread(numPlaguesToStart = 1) {
        console.log('spread plague with numPlaguesToStart',numPlaguesToStart)
        const {planets} = gs.system
        const planetsRandom1 = rndShuffle(planets)
        const plaguesToSpread = []

        for (const planet of planetsRandom1) {
            const news = new PlagueNews(planet)
            if (!news.isValid()) continue
            //news.setDuration(1000) //dont expire naturally
            plaguesToSpread.push(news)
            if (numPlaguesToStart-- <= 0) break
        }

        return plaguesToSpread
    }
}