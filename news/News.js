/**
 * @class News
 * @property {string} name
 * @property {string} newsType
 * @property {number} durationYears
 * @property {number} startYear
 * @property {number} endYear
 * @property {Planet} planet
 * @property {Planet|null} targetPlanet
 * @property {NewsEffect|null} effectOnStart
 * @property {NewsEffect|null} effectOnEnd
 * @property {boolean} started
 * @property {boolean} ended
 */

class News {
    constructor(startedName = '', endedName = '', newsType = NEWS_TYPES_ALL[0], planet = new Planet(), targetPlanet = null, startYear = gs.year) {
        this.startedName = startedName;
        this.endedName = endedName;
        this.newsType = newsType;
        this.durationYears = rng(this.newsType.maxYears, this.newsType.minYears, false);
        this.startYear = startYear;
        this.endYear = this.startYear + this.durationYears;
        this.planet = planet;
        this.targetPlanet = targetPlanet;
        this.startEffects = [];
        this.endEffects = [];
        this.started = false;
        this.ended = false;
    }

    setDuration(newDurationYears = this.durationYears) {
        this.durationYears = newDurationYears;
        this.endYear = this.startYear + this.durationYears;
    }

    calcIsExpired(year = gs.year) {
        return year >= this.endYear;
    }

    get startDescription() {
        return `${this.startYear}: ${colorSpan(this.newsType.name, this.newsType.color, true)} - ${this.startedName}`
    }

    get endDescription() {
        return `${this.endYear}: ${colorSpan(this.newsType.name, this.newsType.color, true)} - ${this.endedName}`
    }

    start() {
        if (this.started || this.ended) throw new Error('news cannot be started after ending or starting already!')
        this.started = true
        gs.system.newsFeed.push(this.startDescription)
        for (const fx of this.startEffects) {
            gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
    }

    end() {
        if (!this.started) throw new Error('news must be started prior to ending!')
        this.ended = true
        gs.system.newsFeed.push(this.endDescription)
        for (const fx of this.endEffects) {
            gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
    }

    static getNews = (planet = new Planet(), newsType = NEWS_TYPES_ALL[0], targetPlanet = null) => {
        return gs.system.news.find(news => 
            (news.planet == planet || news.targetPlanet == planet) && news.newsType == newsType && (!targetPlanet || news.targetPlanet == targetPlanet)
        )
    }

    static getNewsTargeting = (planet = new Planet(), newsType = NEWS_TYPES_ALL[0], originPlanet = null) => {
        return gs.system.news.find(news => 
            (news.targetPlanet == planet) && news.newsType == newsType && (!originPlanet || news.planet == originPlanet)
        )
    }

    static hasNews(planet = new Planet(), newsType = NEWS_TYPES_ALL[0], targetPlanet = null) {
        return this.getNews(planet, newsType, targetPlanet) !== undefined
    }

    static hasNewsTargeting(planet = new Planet(), newsType = NEWS_TYPES_ALL[0], originPlanet = null) {
        return this.getNewsTargeting(planet, newsType, originPlanet) !== undefined
    }

}


/** @class NewsEffect
 * @property {Planet} planet
 * @property {Planet|null} targetPlanet
 * @property {GOVERNMENT_TYPES|null} governmentTypeChangedTo
 * @property {RELATIONSHIP_TYPES|null} relationshipToPlanetChangedTo
 * @property {number} marketPricesModifiedBy
 * @property {number} marketCargoAmountsModifiedBy
 */
class NewsEffect {
    constructor({
        planet = new Planet(),
        targetPlanet = null,
        // Government changes
        newGovernmentType = null,
    
        // Relationship changes
        newRelationship = null,
        
        // Market/Economic changes
        marketPricesModifiedBy = 1.0,
        marketCargoAmountsModifiedBy = 1.0,
        blackMarketPricesModifiedBy = 1.0,
        blackMarketCargoAmountsModifiedBy = 1.0,
        
        // Culture rating changes
        militaryRatingModifiedBy = 1.0,
        industrialRatingModifiedBy = 1.0,
        commercialRatingModifiedBy = 1.0,
        securityRatingModifiedBy = 1.0,
        crimeRatingModifiedBy = 1.0,
        prestigeRatingModifiedBy = 1.0,
        
        // Population and territory changes
        populationModifiedBy = 1.0,
        territoryModifiedBy = 1.0,

        // tech changes
        shipQualityModifiedBy = 1.0,
        officerQualityModifiedBy = 1.0,
        
        // Building changes
        buildingsDisabled = [],
        buildingsEnabled = [],
        
        // Shipyard changes
        shipyardNumShipsModifiedBy = 1.0,
        
        // Guild changes
        guildNumOfficersModifiedBy = 1.0,
        
        // Bank changes
        bankCreditsModifiedBy = 1.0,

        relationsReset = false,
    }) {
        this.planet = planet;
        this.targetPlanet = targetPlanet;
        this.oldGovernmentType = planet.culture.governmentType;
        this.newGovernmentType = newGovernmentType;
        this.oldRelationship = planet.culture.relationships.get(targetPlanet) || null;
        this.newRelationship = newRelationship;
        this.marketPricesModifiedBy = marketPricesModifiedBy;
        this.marketCargoAmountsModifiedBy = marketCargoAmountsModifiedBy;
        this.blackMarketPricesModifiedBy = blackMarketPricesModifiedBy;
        this.blackMarketCargoAmountsModifiedBy = blackMarketCargoAmountsModifiedBy;
        this.militaryRatingModifiedBy = militaryRatingModifiedBy;
        this.industrialRatingModifiedBy = industrialRatingModifiedBy;
        this.commercialRatingModifiedBy = commercialRatingModifiedBy;
        this.securityRatingModifiedBy = securityRatingModifiedBy;
        this.crimeRatingModifiedBy = crimeRatingModifiedBy;
        this.prestigeRatingModifiedBy = prestigeRatingModifiedBy;
        this.populationModifiedBy = populationModifiedBy;
        this.territoryModifiedBy = territoryModifiedBy;
        this.buildingsDisabled = buildingsDisabled;
        this.buildingsEnabled = buildingsEnabled;
        this.guildNumOfficersModifiedBy = guildNumOfficersModifiedBy;
        this.shipyardNumShipsModifiedBy = shipyardNumShipsModifiedBy;
        this.bankCreditsModifiedBy = bankCreditsModifiedBy;
        this.shipQualityModifiedBy = shipQualityModifiedBy;
        this.officerQualityModifiedBy = officerQualityModifiedBy;
        this.relationsReset = relationsReset;
    }

    apply() {
        const {planet, targetPlanet, militaryRatingModifiedBy, newGovernmentType, newRelationship, bankCreditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeRatingModifiedBy, marketPricesModifiedBy, securityRatingModifiedBy, commercialRatingModifiedBy, 
            guildNumOfficersModifiedBy, industrialRatingModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, prestigeRatingModifiedBy} = this;
        const {settlement, culture} = planet

        culture.governmentType = newGovernmentType || culture.governmentType;
        
        if (targetPlanet && newRelationship) {
            culture.relationships.set(targetPlanet, newRelationship);
        }
        culture.shipQuality *= shipQualityModifiedBy;
        culture.officerQuality *= officerQualityModifiedBy;
        culture.militaryRating *= militaryRatingModifiedBy;
        culture.industrialRating *= industrialRatingModifiedBy;
        culture.commercialRating *= commercialRatingModifiedBy;
        culture.securityRating *= securityRatingModifiedBy;
        culture.crimeRating *= crimeRatingModifiedBy;
        culture.prestigeRating *= prestigeRatingModifiedBy;
        culture.population *= populationModifiedBy;
        culture.territory *= territoryModifiedBy;
        for (const building of buildingsDisabled) {
            building.enabled = false;
        }
        for (const building of buildingsEnabled) {
            building.enabled = true;
        }
        if (bankCreditsModifiedBy) {
            settlement.bank.baseCredits = Math.round(settlement.bank.baseCredits * bankCreditsModifiedBy);
            settlement.bank.normalize();
        }
        if (guildNumOfficersModifiedBy) {
            settlement.guild.baseNumOfficers *= guildNumOfficersModifiedBy;
            settlement.guild.normalize();
        }
        if (shipyardNumShipsModifiedBy) {
            settlement.shipyard.baseNumShips *= shipyardNumShipsModifiedBy;
            settlement.shipyard.baseNumModules *= shipyardNumShipsModifiedBy;
            settlement.shipyard.normalize();
        }
        for (const ct of CARGO_TYPES_ALL) {
            settlement.market.cargo.setAmount(ct, Math.round(settlement.market.cargo.getAmount(ct) * marketCargoAmountsModifiedBy));
            settlement.blackMarket.cargo.setAmount(ct, Math.round(settlement.blackMarket.cargo.getAmount(ct) * blackMarketCargoAmountsModifiedBy));
            settlement.market.cargoPriceModifiers.setAmount(ct, settlement.market.cargoPriceModifiers.getAmount(ct) * marketPricesModifiedBy);
            settlement.blackMarket.cargoPriceModifiers.setAmount(ct, settlement.blackMarket.cargoPriceModifiers.getAmount(ct) * blackMarketPricesModifiedBy);
        }
        if (marketCargoAmountsModifiedBy) settlement.market.normalize()
        if (blackMarketCargoAmountsModifiedBy) settlement.blackMarket.normalize()
        if (relationsReset) {
            const eventsToEnd = [...News.getNews(planet, NEWS_TYPES.WAR), ...News.getNews(planet, NEWS_TYPES.BLOCKADE),
                ...News.getNews(planet, NEWS_TYPES.EMBARGO), ...News.getNews(planet, NEWS_TYPES.BOMBARDMENT)]
            for (const ev of eventsToEnd) ev.setDuration(0)
            //we cant just set the relationships directly because it'll interfere with ongoing news, leave modifiers in a screwy state
            //instead, set all related news to expire immediately
        }
    }

    getInverse() {
        const inverseEffect = new NewsEffect({
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            newGovernmentType: this.oldGovernmentType,
            newRelationship: this.oldRelationship,
            buildingsDisabled: this.buildingsEnabled,
            buildingsEnabled: this.buildingsDisabled,
            marketPricesModifiedBy: 1 / this.marketPricesModifiedBy,
            marketCargoAmountsModifiedBy: 1 / this.marketCargoAmountsModifiedBy,
            blackMarketPricesModifiedBy: 1 / this.blackMarketPricesModifiedBy,
            blackMarketCargoAmountsModifiedBy: 1 / this.blackMarketCargoAmountsModifiedBy,
            militaryRatingModifiedBy: 1 / this.militaryRatingModifiedBy,
            industrialRatingModifiedBy: 1 / this.industrialRatingModifiedBy,
            commercialRatingModifiedBy: 1 / this.commercialRatingModifiedBy,
            securityRatingModifiedBy: 1 / this.securityRatingModifiedBy,
            crimeRatingModifiedBy: 1 / this.crimeRatingModifiedBy,
            prestigeRatingModifiedBy: 1 / this.prestigeRatingModifiedBy,
            populationModifiedBy: 1 / this.populationModifiedBy,
            territoryModifiedBy: 1 / this.territoryModifiedBy,
            shipQualityModifiedBy: 1 / this.shipQualityModifiedBy,
            officerQualityModifiedBy: 1 / this.officerQualityModifiedBy,
            guildNumOfficersModifiedBy: 1/this.guildNumOfficersModifiedBy,
            shipyardNumShipsModifiedBy: 1/this.shipyardNumShipsModifiedBy,
            bankCreditsModifiedBy: 1 / this.bankCreditsModifiedBy,
            relationsReset: false, //this cant be undone.
        });
        return inverseEffect
    }

    describe() {
        const {planet, targetPlanet, militaryRatingModifiedBy, newGovernmentType, newRelationship, bankCreditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeRatingModifiedBy, marketPricesModifiedBy, securityRatingModifiedBy, commercialRatingModifiedBy, 
            guildNumOfficersModifiedBy, industrialRatingModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, prestigeRatingModifiedBy} = this;
        const {settlement, culture} = planet

        let msg = ''

        if (newGovernmentType) msg += `- Government: ${coloredName(culture.governmentType)} ➜ ${coloredName(newGovernmentType)}.<br/>`
        if (relationsReset) msg += `- All relationships reset to neutral.<br/>`
        if (targetPlanet && newRelationship) {
            msg += `- Relationship with ${coloredName(targetPlanet)}: ${coloredName(culture.relationships.get(targetPlanet))} ➜ ${coloredName(newRelationship)}.<br/>`
        }

        function dscr(label = '', rating = 1.0, newRating = 1.0, invertColor = false) {
            return `${label}: ${describeRating(rating, invertColor)} ➜ ${describeRating(newRating, invertColor)}.<br/>`
        }

        for (const building of buildingsDisabled) {
            msg += `${colorSpan(`- ${building.name} destroyed`, COLORS.Red, true)}<br/>`
        }
        for (const building of buildingsEnabled) {
            msg += `${colorSpan(`- ${building.name} built`, COLORS.Green, true)}<br/>`
        }

        if (populationModifiedBy !== 1.0) msg += `- Population: ${describePopulation(culture.population)} ➜ ${describePopulation(culture.population*populationModifiedBy)}.<br/>`
        if (territoryModifiedBy !== 1.0) msg += `- Territory: ${describeTerritory(culture.territory)} ➜ ${describeTerritory(culture.territory*territoryModifiedBy)}.<br/>`
        if (prestigeRatingModifiedBy !== 1.0) msg += dscr('- Prestige', culture.prestigeRating, culture.prestigeRating*prestigeRatingModifiedBy)
        if (militaryRatingModifiedBy !== 1.0) msg += dscr('- Government', culture.militaryRating, culture.militaryRating*militaryRatingModifiedBy)
        if (industrialRatingModifiedBy !== 1.0) msg += dscr('- Industrial', culture.industrialRating, culture.industrialRating*industrialRatingModifiedBy)
        if (commercialRatingModifiedBy !== 1.0) msg += dscr('- Commercial', culture.commercialRating, culture.commercialRating*commercialRatingModifiedBy)
        if (securityRatingModifiedBy !== 1.0) msg += dscr('- Security', culture.securityRating, culture.securityRating*securityRatingModifiedBy)
        if (crimeRatingModifiedBy !== 1.0) msg += dscr('- Crime', culture.crimeRating, culture.crimeRating*crimeRatingModifiedBy, true)
        if (shipQualityModifiedBy !== 1.0) msg += dscr('- Ships', culture.shipQuality, culture.shipQuality*shipQualityModifiedBy)
        if (officerQualityModifiedBy !== 1.0) msg += dscr('- Officers', culture.officerQuality, culture.officerQuality*officerQualityModifiedBy)

        if (bankCreditsModifiedBy !== 1.0) {
            msg += `- Bank Credits: ${settlement.bank.baseCredits} ➜ ${settlement.bank.credits*bankCreditsModifiedBy}.<br/>`
        }
        if (guildNumOfficersModifiedBy) {
            msg += `- Guild Officers: ${settlement.guild.baseNumOfficers} ➜ ${Math.round(settlement.guild.baseNumOfficers * guildNumOfficersModifiedBy)}.<br/>`
        }
        if (shipyardNumShipsModifiedBy) {
            msg += `- Shipyard Ships: ${settlement.shipyard.baseNumShips} ➜ ${Math.round(settlement.shipyard.baseNumShips * shipyardNumShipsModifiedBy)}.<br/>`
        }
        if (marketCargoAmountsModifiedBy) {
            msg += `- Market Units Per Cargo Type: ${settlement.market.cargo.average} ➜ ${settlement.market.cargo.average * marketCargoAmountsModifiedBy}.<br/>`
        }
        if (marketCargoAmountsModifiedBy) {
            msg += `- Market Prices: ${settlement.market.cargoPriceModifiers.average}x ➜ ${settlement.market.cargoPriceModifiers.average * marketPricesModifiedBy}x.<br/>`
        }
        if (blackMarketCargoAmountsModifiedBy) {
            msg += `- Black Market Units Per Cargo Type: ${settlement.blackMarket.cargo.average} ➜ ${settlement.blackMarket.cargo.average * blackMarketCargoAmountsModifiedBy}.<br/>`
        }
        if (blackMarketPricesModifiedBy) {
            msg += `- Black Market Prices: ${settlement.blackMarket.cargoPriceModifiers.average}x ➜ ${settlement.blackMarket.cargoPriceModifiers.average * blackMarketPricesModifiedBy}x.<br/>`
        }
        return msg
   }
}