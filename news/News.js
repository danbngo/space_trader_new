/**
 * Represents a news event that affects planets and civilizations over time.
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
    constructor(startedName = '', endedName = '', failedName = '', cancelledName = '', newsType = NT_ALL[0], planet = new Planet(), targetPlanet = null) {
        //console.log('instantiating News with:',{startedName, endedName, newsType, planet, targetPlanet});
        /** @type {string} */
        this.startedName = String(colorSpan(newsType.newsFlavor.symbol + ' ' + startedName, newsType.newsFlavor.color));
        /** @type {string} */
        this.endedName = String(colorSpan(newsType.newsFlavor.symbol + ' ' + endedName, newsType.newsFlavor.color));
        /** @type {string} */
        this.failedName = String(colorSpan(newsType.newsFlavor.symbol + ' ' + failedName, newsType.newsFlavor.color));
        /** @type {string} */
        this.cancelledName = String(colorSpan(newsType.newsFlavor.symbol + ' ' + cancelledName, newsType.newsFlavor.color));
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
        this.completeEffects = [];
        /** @type {NewsEffect[]} */
        /** @type {NewsEffect[]} */
        this.failEffects = [];
        /** @type {NewsEffect[]} */
        this.cancelEffects = [];
        /** @type {boolean} */
        this.started = false;
        /** @type {boolean} */
        this.ended = false;
        /** @type {boolean} */
        this.failed = false;
        /** @type {boolean} */
        this.cancelled = false;
        /** @type {boolean} */
        this.endAsap = false;
        /** @type {number|null} */
        this.endedYear = null;
        this.onTick = (elapsedYears = 1)=>{}
    }

    /**
     * Calculates a half-regression value for civilization level changes.
     * @param {number} magnitude - The magnitude of the effect (default 1.0).
     * @returns {number} Half-regression value.
     */
    static clHalfRegression(magnitude=1.0, fromStartEffect = false) {
        return fromStartEffect ? 1/((1+magnitude)/2) : (1+magnitude)/2
    }
    /**
     * Checks if this news event is valid to start.
     * Override in subclasses to implement specific validation logic.
     * @returns {boolean} True if the event is valid.
     */
    isValid() {
        return true
    }
    /**
     * Checks if this news event can end.
     * Override in subclasses to implement specific end validation logic.
     * @returns {boolean} True if the event can end.
     */
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

    /**
     * Starts the news event, applying all start effects.
     * @throws {Error} If the event has already started or ended.
     */
    start() {
        if (this.started || this.ended) throw new Error('news cannot be started after ending or starting already!')
        //console.log('started news event:',this)
        this.started = true
        //gs.system.newsFeed.push(this.startDescription)
        for (const fx of this.startEffects) {
            //gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
        gs.system.news.push(this)
    }

    /**
     * Determines if the news event should end based on expiration or forced ending.
     * @returns {boolean} True if the event should end.
     */
    shouldEnd() {
        return (this.started && !this.ended && (this.expired || this.endAsap) && this.isValidEnd())
    }

    shouldCancel() {
        //implement in local news files
    }

    /**
     * Applies ongoing effects for this news event.
     * @param {number} elapsedYears - Years elapsed since last update.
     * @throws {Error} If the event hasn't started or has already ended.
     */
    ongo(elapsedYears) {
        if (!this.started) throw new Error('news must be started prior to ongoing!')
        if (this.ended) throw new Error('news has already ended but tried to ongo it!')
        for (const fx of this.ongoingEffects) {
            fx.apply(elapsedYears)
        }
    }

    cancel() {
        this.cancelled = true
        this.end()
    }

    /**
     * Ends the news event, applying appropriate end effects based on failure/cancellation state.
     * @throws {Error} If the event hasn't started yet.
     */
    end() {
        if (!this.started) throw new Error('news must be started prior to ending!')
        //console.log('ending news event:',this)
        this.ended = true
        this.endedYear = gs.year
        
        // Determine the ending state (failed, cancelled, or normal)
        this.determineOutcome()
        
        // Select which effects to apply based on the ending state
        let effectsToApply = this.completeEffects
        if (this.cancelled && this.cancelEffects.length > 0) {
            effectsToApply = this.cancelEffects
        }
        else if (this.failed && this.failEffects.length > 0) {
            effectsToApply = this.failEffects
        }
        if (effectsToApply.length == 0) return; //no end effects to apply, dont update feeds
        //gs.system.newsFeed.push(this.endDescription)
        for (const fx of effectsToApply) {
            //gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
    }

    /**
     * Determines the ending state (failed/cancelled) of the news event.
     * Override in subclasses to implement specific ending logic.
     */
    determineOutcome() {
        //implement in subclasses, no this.failed or this.cancelled = succeeded or went off normally
    }

    /**
     * Gets active news events matching the specified criteria.
     * @param {NewsType|null} newsType - The type of news to filter by (null for all types).
     * @param {Planet|null} planet - The origin planet to filter by (null for all planets).
     * @param {Planet|null} targetPlanet - The target planet to filter by (null for all targets).
     * @returns {News[]} Array of matching news events.
     */
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

    /**
     * Gets news events targeting a specific planet.
     * @param {NewsType} newsType - The type of news to filter by.
     * @param {Planet} targetPlanet - The target planet.
     * @param {Planet|null} originPlanet - The origin planet (null for any origin).
     * @returns {News[]} Array of matching news events.
     */
    static getNewsTargeting = (newsType = NT_ALL[0], targetPlanet = new Planet(), originPlanet = null) => {
        return this.getNews(newsType, originPlanet, targetPlanet)
    }

    /**
     * Checks if any active news events match the specified criteria.
     * @param {NewsType} newsType - The type of news to check for.
     * @param {Planet|null} planet - The origin planet (null for any planet).
     * @param {Planet|null} targetPlanet - The target planet (null for any target).
     * @returns {boolean} True if matching news exists.
     */
    static hasNews(newsType = NT_ALL[0], planet = null, targetPlanet = null) {
        return this.getNews(newsType, planet, targetPlanet).length > 0
    }

    /**
     * Gets all news events originating from a planet matching any of the specified types.
     * @param {Planet} planet - The origin planet.
     * @param {NewsType[]} newsTypes - Array of news types to check for.
     * @returns {News[]} Array of matching news events.
     */
    static planetGetAnyNews(planet = new Planet(), newsTypes = []) {
        const news = []
        for (const nt of newsTypes) {
            news.push(...this.getNews(nt, planet))
        }
        return news
    }
    /**
     * Gets all news events targeting a planet matching any of the specified types.
     * @param {Planet} planet - The target planet.
     * @param {NewsType[]} newsTypes - Array of news types to check for.
     * @returns {News[]} Array of matching news events.
     */
    static planetGetAnyNewsTargeting(planet = new Planet(), newsTypes = []) {
        const news = []
        for (const nt of newsTypes) {
            news.push(...this.getNewsTargeting(nt, planet))
        }
        return news
    }
    /**
     * Checks if a planet has any active news events of the specified types as the origin.
     * @param {Planet} planet - The origin planet.
     * @param {NewsType[]} newsTypes - Array of news types to check for.
     * @returns {boolean} True if matching news exists.
     */
    static planetHasAnyNews(planet = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNews(nt, planet)) return true
        }
    }
    /**
     * Checks if a planet is targeted by any active news events of the specified types.
     * @param {Planet} planet - The target planet.
     * @param {NewsType[]} newsTypes - Array of news types to check for.
     * @returns {boolean} True if matching news exists.
     */
    static planetHasAnyNewsTargeting(planet = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNewsTargeting(nt, planet)) return true
        }
    }
    /**
     * Checks if there are any news events of a specific type targeting a planet.
     * @param {NewsType} newsType - The type of news to check for.
     * @param {Planet} targetPlanet - The target planet.
     * @param {Planet|null} originPlanet - The origin planet (null for any origin).
     * @returns {boolean} True if matching news exists.
     */
    static hasNewsTargeting(newsType = NT_ALL[0], targetPlanet = new Planet(), originPlanet = null) {
        return this.getNewsTargeting(newsType, targetPlanet, originPlanet).length > 0
    }

    /**
     * Checks if there is a news event of a specific type between two planets in either direction.
     * @param {Planet} planetA - The first planet.
     * @param {Planet} planetB - The second planet.
     * @param {NewsType} newsType - The type of news to check for.
     * @returns {boolean} True if matching news exists in either direction.
     */
    static hasNewsBidirectional(planetA = new Planet(), planetB = new Planet(), newsType = NT_ALL[0]) {
        return this.hasNews(newsType, planetA, planetB) || this.hasNews(newsType, planetB, planetA)
    }
    /**
     * Checks if there are any news events of the specified types between two planets in either direction.
     * @param {Planet} planetA - The first planet.
     * @param {Planet} planetB - The second planet.
     * @param {NewsType[]} newsTypes - Array of news types to check for.
     * @returns {boolean} True if matching news exists in either direction.
     */
    static hasAnyNewsBidirectional(planetA = new Planet(), planetB = new Planet(), newsTypes = []) {
        for (const nt of newsTypes) {
            if (this.hasNewsBidirectional(planetA, planetB, nt)) return true
        }
        return false
    }

    /**
     * Forces all hostile/martial news events involving a planet to end immediately.
     * @param {Planet} targetPlanet - The planet to cease hostilities for.
     */
    static forcePeace(targetPlanet = new Planet()) {
        //all hostile news involving this planet expire immediately
        //console.log('ceasing all hostilities involving:',targetPlanet.name)
        const newsToEnd = gs.system.news.filter(n=>(
            (n.planet === targetPlanet || n.targetPlanet === targetPlanet) &&
            NT_MARTIAL.includes(n.newsType) &&
            !n.ended
        ))
        //console.log('found news items to end:',newsToEnd)
        for (const n of newsToEnd) {
            n.endAsap = true
            if (n.shouldCancel()) n.cancel()
            else if (n.shouldEnd()) n.end()
        }
    }

    /**
     * Forces all hostile or cooperative news events originating from a planet to end immediately.
     * @param {Planet} planet - The planet to withdraw from foreign activity.
     */
    static forceWithdrawal(planet = new Planet()) {
        //all hostile or cooperative acts FROM this planet expire immediately
        //console.log('ceasing all foreign activity involving:',planet.name)
        const newsToEnd = gs.system.news.filter(n=>(
            (n.planet === planet) &&
            (NT_COOPERATION_PREVENTING.includes(n.newsType) || NT_COOPERATIVE.includes(n.newsType))
            && !n.ended
        ))
        //console.log('found news items to end:',newsToEnd)
        for (const n of newsToEnd) {
            n.endAsap = true
            if (n.shouldCancel()) n.cancel()
            else if (n.shouldEnd()) n.end()
        }
    }

    /**
     * Processes all active news events, applying ongoing effects and ending expired events.
     * Removes ancient history beyond NEWS_MAX_AGE.
     * @param {number} elapsedYears - Years elapsed since last update (default 0).
     */
    static processNews(elapsedYears = 0) {
        //remove anything older than the threshold
        const ancientHistory = []
        for (const news of gs.system.news) {
            if (news.shouldCancel()) {
                news.cancel()
            }
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

    /**
     * Calculates possible relationship-worsening news events targeting a planet.
     * @param {Planet} targetPlanet - The planet to calculate worsening news for.
     * @returns {[News[], News[], News[]]} Tuple of [all news, war news, tensions news].
     */
    static calcRelationshipWorseningNews = (targetPlanet = new Planet()) => {
        const possibleHostileNews = []
        const possibleWarNews = []
        for (const otherPlanet of gs.system.planets) {
            if (otherPlanet == targetPlanet) continue
            const relationship = otherPlanet.c.relationships.get(targetPlanet)
            if (relationship == RELATIONSHIP_TYPES.NEUTRAL) {
                const n = new TensionsNews(otherPlanet, targetPlanet)
                //skip political considerations as this is about raw power/survival
                if (n.isValid()) possibleHostileNews.push(n)
            } else if (relationship == RELATIONSHIP_TYPES.TENSE) {
                const n = new WarNews(otherPlanet, targetPlanet)
                //skip political considerations as this is about raw power/survival
                if (n.isValid()) possibleWarNews.push(n)
            }
        }
        const news = [...possibleHostileNews, ...possibleWarNews]
        return [news, possibleWarNews, possibleHostileNews]
    }

    /**
     * Gets all enabled (destroyable) buildings on a planet.
     * @param {Planet} targetPlanet - The planet to check.
     * @returns {Building[]} Array of enabled buildings.
     */
    static calcDestroyableBuildings = (targetPlanet = new Planet())=> {
        return targetPlanet.s.buildings.filter(b => b.enabled);
    }

    /**
     * Gets all disabled (repairable) buildings on a planet.
     * @param {Planet} targetPlanet - The planet to check.
     * @returns {Building[]} Array of disabled buildings.
     */
    static calcRepairableBuildings = (targetPlanet = new Planet())=> {
        return targetPlanet.s.buildings.filter(b => !b.enabled);
    }

    /**
     * Rolls for failure based on success chance and difficulty modifier.
     * Sets this.failed = true if the roll fails.
     * @param {number} successChance - The base chance of success (default 0.5).
     * @param {number} difficultyModifier - The difficulty modifier (default CL.MEDIUM).
     */
    rollOutcome(successChance=0.5, difficultyModifier=CL.MEDIUM) {
        const roll = Math.random()
        const didFail = (2*roll*successChance) < difficultyModifier
        if (didFail) this.failed = true
    }
}

