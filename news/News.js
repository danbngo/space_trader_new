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
        this.startedName = startedName;
        /** @type {string} */
        this.endedName = endedName;
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
    }

    setDuration(newDurationYears = this.durationYears) {
        this.durationYears = newDurationYears;
        this.endYear = this.startYear + this.durationYears;
    }

    get expired() {
        return gs.year >= this.endYear;
    }

    get startDescription() {
        return `${describeDate(this.startYear)}: ${this.startedName}`
    }

    get endDescription() {
        return `${describeDate(this.endYear)}: ${this.endedName}`
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
        if (this.endEffects.length == 0) return; //no end effects to apply, dont update feeds
        gs.system.newsFeed.push(this.endDescription)
        for (const fx of this.endEffects) {
            gs.system.newsFeed.push(fx.describe())
            fx.apply()
        }
    }

    static getNews = (planet = new Planet(), newsType = NEWS_TYPES_ALL[0], targetPlanet = null) => {
        return gs.system.news.filter(news => {
            if (news.ended || !news.started) return false
            if (newsType && news.newsType != newsType) return false
            if (planet && news.planet && planet != news.planet) return false
            if (targetPlanet && news.targetPlanet && targetPlanet != news.targetPlanet) return false
            return true
        })
    }

    static getNewsTargeting = (targetPlanet = new Planet(), newsType = NEWS_TYPES_ALL[0], originPlanet = null) => {
        return this.getNews(targetPlanet, newsType, originPlanet)
    }

    static hasNews(planet = new Planet(), newsType = NEWS_TYPES_ALL[0], targetPlanet = null) {
        return this.getNews(planet, newsType, targetPlanet).length > 0
    }

    static hasNewsTargeting(targetPlanet = new Planet(), newsType = NEWS_TYPES_ALL[0], originPlanet = null) {
        return this.getNewsTargeting(targetPlanet, newsType, originPlanet).length > 0
    }

}


/**
 * Represents the effects a news event has on a planet's culture, economy, and relationships.
 * @class NewsEffect
 */
class NewsEffect {
    /**
     * @param {Object} params - The effect parameters.
     * @param {Planet} params.planet - The planet affected.
     * @param {Planet|null} [params.targetPlanet] - The target planet for relationship changes.
     * @param {GovernmentType|null} [params.newGovernmentTypeType] - New government type to change to.
     * @param {RelationshipType|null} [params.newRelationship] - New relationship with target planet.
     * @param {number} [params.marketPricesModifiedBy] - Multiplier for market prices (inflation).
     * @param {number} [params.marketCargoAmountsModifiedBy] - Multiplier for market cargo quantities.
     * @param {number} [params.blackMarketPricesModifiedBy] - Multiplier for black market prices.
     * @param {number} [params.blackMarketCargoAmountsModifiedBy] - Multiplier for black market cargo quantities.
     * @param {number} [params.militaryRatingModifiedBy] - Multiplier for military rating.
     * @param {number} [params.industrialRatingModifiedBy] - Multiplier for industrial rating.
     * @param {number} [params.commercialRatingModifiedBy] - Multiplier for commercial rating.
     * @param {number} [params.securityRatingModifiedBy] - Multiplier for security rating.
     * @param {number} [params.crimeRatingModifiedBy] - Multiplier for crime rating.
     * @param {number} [params.prestigeRatingModifiedBy] - Multiplier for prestige rating.
     * @param {number} [params.populationModifiedBy] - Multiplier for population.
     * @param {number} [params.territoryModifiedBy] - Multiplier for territory.
     * @param {number} [params.shipQualityModifiedBy] - Multiplier for ship quality.
     * @param {number} [params.officerQualityModifiedBy] - Multiplier for officer quality.
     * @param {Building[]} [params.buildingsDisabled] - Buildings to disable.
     * @param {Building[]} [params.buildingsEnabled] - Buildings to enable.
     * @param {number} [params.shipyardNumShipsModifiedBy] - Multiplier for shipyard inventory.
     * @param {number} [params.guildNumOfficersModifiedBy] - Multiplier for guild officer availability.
     * @param {Map<CargoType, number>} [params.cargoPriceModifiers] - Cargo-specific price modifiers.
     * @param {number} [params.creditsModifiedBy] - Multiplier for building credits.
     * @param {boolean} [params.relationsReset] - Whether to reset all relationships to neutral.
     * @param {function(): void} [params.onApply] - Custom callback function when effect is applied.
     */
    constructor({
        planet = new Planet(),
        targetPlanet = null,
        // GovernmentType changes
        newGovernmentTypeType = null,
    
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

        //Market and black market changes
        cargoPriceModifiers = new Map(),
        
        // Bank changes
        creditsModifiedBy = 1.0,

        relationsReset = false,

        onApply = ()=>{},
    }) {
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {GovernmentType} */
        this.oldGovernmentTypeType = planet.culture.governmentType;
        /** @type {GovernmentType|null} */
        this.newGovernmentTypeType = newGovernmentTypeType;
        /** @type {RelationshipType|null} */
        this.oldRelationship = planet.culture.relationships.get(targetPlanet) || null;
        /** @type {RelationshipType|null} */
        this.newRelationship = newRelationship;
        /** @type {number} */
        this.marketPricesModifiedBy = marketPricesModifiedBy;
        /** @type {number} */
        this.marketCargoAmountsModifiedBy = marketCargoAmountsModifiedBy;
        /** @type {number} */
        this.blackMarketPricesModifiedBy = blackMarketPricesModifiedBy;
        /** @type {number} */
        this.blackMarketCargoAmountsModifiedBy = blackMarketCargoAmountsModifiedBy;
        /** @type {number} */
        this.militaryRatingModifiedBy = militaryRatingModifiedBy;
        /** @type {number} */
        this.industrialRatingModifiedBy = industrialRatingModifiedBy;
        /** @type {number} */
        this.commercialRatingModifiedBy = commercialRatingModifiedBy;
        /** @type {number} */
        this.securityRatingModifiedBy = securityRatingModifiedBy;
        /** @type {number} */
        this.crimeRatingModifiedBy = crimeRatingModifiedBy;
        /** @type {number} */
        this.prestigeRatingModifiedBy = prestigeRatingModifiedBy;
        /** @type {number} */
        this.populationModifiedBy = populationModifiedBy;
        /** @type {number} */
        this.territoryModifiedBy = territoryModifiedBy;
        /** @type {Building[]} */
        this.buildingsDisabled = buildingsDisabled;
        /** @type {Building[]} */
        this.buildingsEnabled = buildingsEnabled;
        /** @type {number} */
        this.guildNumOfficersModifiedBy = guildNumOfficersModifiedBy;
        /** @type {number} */
        this.shipyardNumShipsModifiedBy = shipyardNumShipsModifiedBy;
        /** @type {number} */
        this.creditsModifiedBy = creditsModifiedBy;
        /** @type {number} */
        this.shipQualityModifiedBy = shipQualityModifiedBy;
        /** @type {number} */
        this.officerQualityModifiedBy = officerQualityModifiedBy;
        /** @type {boolean} */
        this.relationsReset = relationsReset;
        /** @type {Map<CargoType, number>} */
        this.cargoPriceModifiers = cargoPriceModifiers;
        /** @type {function(): void} */
        this.onApply = onApply //use sparingly!
    }

    apply() {
        const {planet, targetPlanet, militaryRatingModifiedBy, newGovernmentTypeType, newRelationship, creditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeRatingModifiedBy, marketPricesModifiedBy, securityRatingModifiedBy, commercialRatingModifiedBy, 
            guildNumOfficersModifiedBy, industrialRatingModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, prestigeRatingModifiedBy, cargoPriceModifiers} = this;
        const {settlement, culture} = planet

        culture.governmentType = newGovernmentTypeType || culture.governmentType;
        
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
        if (creditsModifiedBy) {
            for (const building of settlement.buildings) {
                building.baseCredits = Math.round(building.baseCredits * creditsModifiedBy);
                building.normalize();
            }
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
        if (marketPricesModifiedBy) settlement.market.inflation *= marketPricesModifiedBy;
        if (blackMarketPricesModifiedBy) settlement.blackMarket.inflation *= blackMarketPricesModifiedBy;
        for (const ct of CARGO_TYPES_ALL) {
            settlement.market.baseCargo.setAmount(ct, Math.round(settlement.market.cargo.getAmount(ct) * marketCargoAmountsModifiedBy));
            settlement.blackMarket.baseCargo.setAmount(ct, Math.round(settlement.blackMarket.cargo.getAmount(ct) * blackMarketCargoAmountsModifiedBy));
        }
        if (marketCargoAmountsModifiedBy) settlement.market.normalize()
        if (blackMarketCargoAmountsModifiedBy) settlement.blackMarket.normalize()
        if (relationsReset) {
            const eventsToEnd = [...News.getNews(planet, NEWS_TYPES.WAR), ...News.getNews(planet, NEWS_TYPES.EMBARGO), ...News.getNews(planet, NEWS_TYPES.BOMBARDMENT)]
            for (const ev of eventsToEnd) ev.setDuration(0)
            //we cant just set the relationships directly because it'll interfere with ongoing news, leave modifiers in a screwy state
            //instead, set all related news to expire immediately
        }
        if (targetPlanet && newRelationship) {
            culture.relationships.set(targetPlanet, newRelationship);
        }
        for (const [cargoType, modifier] of cargoPriceModifiers) {
            culture.cargoPriceModifiers.multiply(cargoType, modifier);
        }
        this.onApply();
    }

    getInverse() {
        const inverseEffect = new NewsEffect({
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            newGovernmentTypeType: this.oldGovernmentTypeType,
            newRelationship: null,
            onApply: null,
            //newRelationship: this.oldRelationship, //MUST be handled through onApply as relationships can evolve mid-event
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
            creditsModifiedBy: 1 / this.creditsModifiedBy,
            cargoPriceModifiers: new Map(Array.from(this.cargoPriceModifiers.entries()).map(([ct, mod]) => [ct, 1/mod])),
            relationsReset: false, //this cant be undone.
        });
        return inverseEffect
    }

    describe() {
        const {planet, targetPlanet, militaryRatingModifiedBy, newGovernmentTypeType, newRelationship, creditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeRatingModifiedBy, marketPricesModifiedBy, securityRatingModifiedBy, commercialRatingModifiedBy, 
            guildNumOfficersModifiedBy, industrialRatingModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, prestigeRatingModifiedBy, cargoPriceModifiers} = this;
        const {settlement, culture} = planet

        let msg = ''

        if (newGovernmentTypeType) msg += `- GovernmentType: ${coloredName(culture.governmentType)} ➜ ${coloredName(newGovernmentTypeType)}.<br/>`
        if (relationsReset) msg += `- All relationships reset to neutral.<br/>`
        if (targetPlanet && newRelationship) {
            msg += `- Relationship with ${coloredName(targetPlanet)}: ${coloredName(culture.relationships.get(targetPlanet))} ➜ ${coloredName(newRelationship)}.<br/>`
        }

        function dscr(label = '', rating = 1.0, newRating = 1.0, invertColor = false) {
            return `${label}: ${describeRating(rating, invertColor)} ➜ ${describeRating(newRating, invertColor)}.<br/>`
        }

        for (const building of buildingsDisabled) {
            msg += `${colorSpan(`- ${building.buildingType.name} destroyed`, COLORS.Red, true)}<br/>`
        }
        for (const building of buildingsEnabled) {
            msg += `${colorSpan(`- ${building.buildingType.name} built`, COLORS.Green, true)}<br/>`
        }

        for (const [cargoType, modifier] of cargoPriceModifiers.entries()) {
            msg += `- Demand for ${cargoType.name}: ${culture.cargoPriceModifiers.getAmount(cargoType)}x ➜ ${culture.cargoPriceModifiers.getAmount(cargoType)*modifier}x.<br/>`
        }

        if (populationModifiedBy !== 1.0) msg += `- Population: ${describePopulation(culture.population)} ➜ ${describePopulation(culture.population*populationModifiedBy)}.<br/>`
        if (territoryModifiedBy !== 1.0) msg += `- Territory: ${describeTerritory(culture.territory)} ➜ ${describeTerritory(culture.territory*territoryModifiedBy)}.<br/>`
        if (prestigeRatingModifiedBy !== 1.0) msg += dscr('- Prestige', culture.prestigeRating, culture.prestigeRating*prestigeRatingModifiedBy)
        if (militaryRatingModifiedBy !== 1.0) msg += dscr('- GovernmentType', culture.militaryRating, culture.militaryRating*militaryRatingModifiedBy)
        if (industrialRatingModifiedBy !== 1.0) msg += dscr('- Industrial', culture.industrialRating, culture.industrialRating*industrialRatingModifiedBy)
        if (commercialRatingModifiedBy !== 1.0) msg += dscr('- Commercial', culture.commercialRating, culture.commercialRating*commercialRatingModifiedBy)
        if (securityRatingModifiedBy !== 1.0) msg += dscr('- Security', culture.securityRating, culture.securityRating*securityRatingModifiedBy)
        if (crimeRatingModifiedBy !== 1.0) msg += dscr('- Crime', culture.crimeRating, culture.crimeRating*crimeRatingModifiedBy, true)
        if (shipQualityModifiedBy !== 1.0) msg += dscr('- Ships', culture.shipQuality, culture.shipQuality*shipQualityModifiedBy)
        if (officerQualityModifiedBy !== 1.0) msg += dscr('- Officers', culture.officerQuality, culture.officerQuality*officerQualityModifiedBy)

        if (creditsModifiedBy !== 1.0) {
            msg += `- Bank Credits: ${settlement.bank.baseCredits} ➜ ${settlement.bank.credits*creditsModifiedBy}.<br/>`
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
            msg += `- Market Prices: ${settlement.market.inflation}x ➜ ${settlement.market.inflation * marketPricesModifiedBy}x.<br/>`
        }
        if (blackMarketCargoAmountsModifiedBy) {
            msg += `- Black Market Units Per Cargo Type: ${settlement.blackMarket.cargo.average} ➜ ${settlement.blackMarket.cargo.average * blackMarketCargoAmountsModifiedBy}.<br/>`
        }
        if (blackMarketPricesModifiedBy) {
            msg += `- Black Market Prices: ${settlement.blackMarket.inflation}x ➜ ${settlement.blackMarket.inflation * blackMarketPricesModifiedBy}x.<br/>`
        }
        return msg
   }

   isValid() {
       return true
   }
   isValidEnd() {
       return true
   }
}