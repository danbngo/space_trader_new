/**
 * Represents a news event that affects planets and cultures over time.
 * @class News
 */
class News {
    /**
     * @param {string} startedName - The name/description of the event when it starts.
     * @param {string} endedName - The name/description of the event when it ends.
     * @param {NewsType} newsType - The type of news event.
     * @param {Planet} planet - The planet where the event originates.
     * @param {Planet|null} targetPlanet - The target planet affected by the event (if any).
     */
    constructor(startedName = '', endedName = '', newsType = NEWS_TYPES_ALL[0], planet = new Planet(), targetPlanet = null) {
        //console.log('instantiating News with:',{startedName, endedName, newsType, planet, targetPlanet});
        /** @type {string} */
        this.startedName = String(colorSpan(startedName, newsType.color));
        /** @type {string} */
        this.endedName = String(colorSpan(endedName, newsType.color));
        /** @type {NewsType} */
        this.newsType = newsType;
        /** @type {number} */
        this.durationYears = rng(this.newsType.maxYears, this.newsType.minYears, false);
        /** @type {number} */
        this.startYear = gs.year;
        /** @type {number} */
        this.endYear = this.startYear + this.durationYears;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {NewsEffect[]} */
        this.startEffects = [];
        /** @type {NewsEffect[]} */
        this.endEffects = [];
        /** @type {boolean} */
        this.started = false;
        /** @type {boolean} */
        this.ended = false;
        this.ongoingEffects = []
        this.endAsap = false;
        this.endedYear = null;
    }

    //implement in sub-classes
    isValid() {
        return true
    }
    isValidEnd() {
        return true
    }

    get expired() {
        return gs.year >= this.endYear;
    }

    get startDescription() {
        return `${describeDate(this.startYear)}: ${this.startedName}`
    }

    get endDescription() {
        return `${describeDate(this.endedYear)}: ${this.endedName}`
    }

    start() {
        if (this.started || this.ended) throw new Error('news cannot be started after ending or starting already!')
        this.started = true
        //gs.system.newsFeed.push(this.startDescription)
        for (const fx of this.startEffects) {
            //gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
        gs.system.news.push(this)
    }

    shouldEnd() {
        return (this.started && !this.ended && (this.expired || this.endAsap) && this.isValidEnd())
    }

    ongo(elapsedYears) {
        if (!this.started) throw new Error('news must be started prior to ongoing!')
        if (this.ended) throw new Error('news has already ended but tried to ongo it!')
        for (const fx of this.ongoingEffects) {
            fx.apply(elapsedYears)
        }
    }

    end() {
        if (!this.started) throw new Error('news must be started prior to ending!')
        this.ended = true
        this.endedYear = gs.year
        if (this.endEffects.length == 0) return; //no end effects to apply, dont update feeds
        //gs.system.newsFeed.push(this.endDescription)
        for (const fx of this.endEffects) {
            //gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
    }

    static getNews = (newsType = null, planet = null, targetPlanet = null) => {
        return gs.system.news.filter(news => {
            if (news.ended || !news.started) return false
            if (newsType && news.newsType != newsType) return false
            if (planet && !news.planet) return false
            if (planet && planet != news.planet) return false
            if (targetPlanet && !news.targetPlanet) return false
            if (targetPlanet && targetPlanet != news.targetPlanet) return false
            return true
        })
    }

    static getNewsTargeting = (newsType = NEWS_TYPES_ALL[0], targetPlanet = new Planet(), originPlanet = null) => {
        return this.getNews(newsType, originPlanet, targetPlanet)
    }

    static hasNews(newsType = NEWS_TYPES_ALL[0], planet = null, targetPlanet = null) {
        return this.getNews(newsType, planet, targetPlanet).length > 0
    }

    static planetGetAnyNews(planet = new Planet(), newsTypes = []) {
        const news = []
        for (const nt of newsTypes) {
            news.push(...this.getNews(nt, planet))
        }
        return news
    }
    static planetGetAnyNewsTargeting(planet = new Planet(), newsTypes = []) {
        const news = []
        for (const nt of newsTypes) {
            news.push(...this.getNewsTargeting(nt, planet))
        }
        return news
    }
    static planetHasAnyNews(planet = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNews(nt, planet)) return true
        }
    }
    static planetHasAnyNewsTargeting(planet = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNewsTargeting(nt, planet)) return true
        }
    }
    static hasNewsTargeting(newsType = NEWS_TYPES_ALL[0], targetPlanet = new Planet(), originPlanet = null) {
        return this.getNewsTargeting(newsType, targetPlanet, originPlanet).length > 0
    }

    static hasNewsBidirectional(planetA = new Planet(), planetB = new Planet(), newsType = NEWS_TYPES_ALL[0]) {
        return this.hasNews(newsType, planetA, planetB) || this.hasNews(newsType, planetB, planetA)
    }
    static hasAnyNewsBidirectional(planetA = new Planet(), planetB = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNewsBidirectional(planetA, planetB, nt)) return true
        }
        return false
    }

    static forcePeace(targetPlanet = new Planet()) {
        //all hostile news involving this planet expire immediately
        //console.log('ceasing all hostilities involving:',targetPlanet.name)
        const newsToEnd = gs.system.news.filter(n=>(
            (n.planet === targetPlanet || n.targetPlanet === targetPlanet) &&
            NEWS_TYPES_HOSTILE.includes(n.newsType) &&
            !n.ended
        ))
        //console.log('found news items to end:',newsToEnd)
        for (const n of newsToEnd) {
            n.endAsap = true
            if (n.shouldEnd()) n.end()
        }
    }

    static forceWithdrawal(planet = new Planet()) {
        //all hostile or cooperative acts FROM this planet expire immediately
        //console.log('ceasing all foreign activity involving:',planet.name)
        const newsToEnd = gs.system.news.filter(n=>(
            (n.planet === planet) &&
            (NEWS_TYPES_HOSTILE.includes(n.newsType) || NEWS_TYPES_COOPERATIVE.includes(n.newsType))
            && !n.ended
        ))
        //console.log('found news items to end:',newsToEnd)
        for (const n of newsToEnd) {
            n.endAsap = true
            if (n.shouldEnd()) n.end()
        }
    }

    static processNews(elapsedYears = 0) {
        //remove anything older than the threshold
        const ancientHistory = []
        for (const news of gs.system.news) {
            if (news.shouldEnd()) {
                news.end()
            }
            else {
                if (!news.ended && news.started && news.ongo) news.ongo(elapsedYears)
            }
            if (news.ended && (gs.year - news.endedYear) >= NEWS_MAX_AGE) {
                ancientHistory.push(news)
            }
        }
        if (!DEBUG_MODE_ENABLED) for (const oldNews of ancientHistory) {
            const index = gs.system.news.indexOf(oldNews)
            if (index > -1) {
                gs.system.news.splice(index, 1)
            }
        }
    }
}

