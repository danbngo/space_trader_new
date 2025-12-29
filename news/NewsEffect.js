
/**
 * Represents the effects a news event has on a planet's culture, economy, and relationships.
 * @class NewsEffect
 */
class NewsEffect {
    /**
     * @param {Object} params - The effect parameters.
     * @param {Planet} [params.planet] - The planet affected.
     * @param {Planet|null} [params.targetPlanet] - The target planet for relationship changes.
     * @param {GovernmentType|null} [params.newGovernmentType] - New government type to change to.
     * @param {RelationshipType|null} [params.newRelationship] - New relationship with target planet.
     * @param {number} [params.marketPrices] - Multiplier for market prices (inflation).
     * @param {number} [params.marketCargoAmounts] - Multiplier for market cargo quantities.
     * @param {number} [params.blackMarketPrices] - Multiplier for black market prices.
     * @param {number} [params.blackMarketCargoAmounts] - Multiplier for black market cargo quantities.
     * @param {number} [params.military] - Multiplier for military rating.
     * @param {number} [params.industry] - Multiplier for industrial rating.
     * @param {number} [params.economy] - Multiplier for commercial rating.
     * @param {number} [params.security] - Multiplier for security rating.
     * @param {number} [params.crime] - Multiplier for crime rating.
     * @param {number} [params.prestige] - Multiplier for prestige rating.
     * @param {number} [params.population] - Multiplier for population.
     * @param {number} [params.territory] - Multiplier for territory.
     * @param {number} [params.shipQuality] - Multiplier for ship quality.
     * @param {number} [params.officerQuality] - Multiplier for officer quality.
     * @param {Building[]} [params.buildingsDisabled] - Buildings to disable.
     * @param {Building[]} [params.buildingsEnabled] - Buildings to enable.
     * @param {number} [params.shipyardNumShips] - Multiplier for shipyard inventory.
     * @param {number} [params.guildNumOfficers] - Multiplier for guild officer availability.
     * @param {Map<CargoType, number>} [params.cargoPriceModifiers] - Cargo-specific price modifiers.
     * @param {number} [params.credits] - Multiplier for building credits.
     * @param {boolean} [params.relationsReset] - Whether to reset all relationships to neutral.
     * @param {boolean} [params.forcePeace] - Whether to cease hostilities TARGETING this planet.
     * @param {boolean} [params.forceWithdrawal] - Whether to force this planet to withdraw from the solar stage.
     * @param {function(): void} [params.onApply] - Custom callback function when effect is applied.
     */
    constructor({
        planet = null,
        targetPlanet = null,
        // GovernmentType changes
        newGovernmentType = null,
    
        // Relationship changes
        newRelationship = null,
        
        // Market/Economic changes
        marketPrices = 1.0,
        marketCargoAmounts = 1.0,
        blackMarketPrices = 1.0,
        blackMarketCargoAmounts = 1.0,
        
        // Culture rating changes
        military = 1.0,
        industry = 1.0,
        economy = 1.0,
        security = 1.0,
        crime = 1.0,
        prestige = 1.0,
        
        // Population and territory changes
        population = 1.0,
        territory = 1.0,

        // tech changes
        shipQuality = 1.0,
        officerQuality = 1.0,
        
        // Building changes
        buildingsDisabled = [],
        buildingsEnabled = [],
        
        // Shipyard changes
        shipyardNumShips = 1.0,
        
        // Guild changes
        guildNumOfficers = 1.0,

        //Market and black market changes
        cargoPriceModifiers = new Map(),
        
        // Bank changes
        credits = 1.0,

        relationsReset = false,
        forcePeace = false,
        forceWithdrawal = false,

        onApply = ()=>{},
    }) {
        /** @type {Planet|null} */
        this.planet = planet;
        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {GovernmentType} */
        this.oldGovernmentType = planet && planet.culture ? planet.culture.governmentType : null;
        /** @type {GovernmentType|null} */
        this.newGovernmentType = newGovernmentType;
        /** @type {RelationshipType|null} */
        this.oldRelationship = planet && planet.culture ? planet.culture.relationships.get(targetPlanet) || null : null;
        /** @type {RelationshipType|null} */
        this.newRelationship = newRelationship;
        /** @type {number} */
        this.marketPrices = marketPrices;
        /** @type {number} */
        this.marketCargoAmounts = marketCargoAmounts;
        /** @type {number} */
        this.blackMarketPrices = blackMarketPrices;
        /** @type {number} */
        this.blackMarketCargoAmounts = blackMarketCargoAmounts;
        /** @type {number} */
        this.military = military;
        /** @type {number} */
        this.industry = industry;
        /** @type {number} */
        this.economy = economy;
        /** @type {number} */
        this.security = security;
        /** @type {number} */
        this.crime = crime;
        /** @type {number} */
        this.prestige = prestige;
        /** @type {number} */
        this.population = population;
        /** @type {number} */
        this.territory = territory;
        /** @type {Building[]} */
        this.buildingsDisabled = buildingsDisabled;
        /** @type {Building[]} */
        this.buildingsEnabled = buildingsEnabled;
        /** @type {number} */
        this.guildNumOfficers = guildNumOfficers;
        /** @type {number} */
        this.shipyardNumShips = shipyardNumShips;
        /** @type {number} */
        this.credits = credits;
        /** @type {number} */
        this.shipQuality = shipQuality;
        /** @type {number} */
        this.officerQuality = officerQuality;
        /** @type {boolean} */
        this.relationsReset = relationsReset;
        /** @type {boolean} */
        this.forcePeace = forcePeace;
        /** @type {boolean} */
        this.forceWithdrawal = forceWithdrawal;
        /** @type {Map<CargoType, number>} */
        this.cargoPriceModifiers = cargoPriceModifiers;
        /** @type {function(): void} */
        this.onApply = onApply //use sparingly!
        this.fired = false;
    }

    apply(elapsedYears = 0) {
        const {planet, targetPlanet, military, newGovernmentType, newRelationship, credits, 
            blackMarketCargoAmounts, blackMarketPrices, buildingsDisabled, buildingsEnabled, territory,
            population, crime, marketPrices, security, economy, 
            guildNumOfficers, industry, shipyardNumShips, marketCargoAmounts, fired,
            shipQuality, officerQuality, relationsReset, forcePeace, forceWithdrawal, prestige, cargoPriceModifiers} = this;

        this.fired = true;

        if (planet && planet.culture) {
            const {culture} = planet
            culture.governmentType = newGovernmentType || culture.governmentType;
            culture.shipQuality *= shipQuality;
            culture.officerQuality *= officerQuality;
            culture.military *= military;
            culture.industry *= industry;
            culture.economy *= economy;
            culture.security *= security;
            culture.crime *= crime;
            culture.prestige *= prestige;
            culture.population *= population;
            culture.territory *= territory;
            //FIRST end any wars to let their completeEffects run
            if (forcePeace) {
                News.forcePeace(planet)
            }
            if (forceWithdrawal) {
                News.forceWithdrawal(planet)
            }
            //THEN reset all relationships
            if (relationsReset) {
                const eventsToEnd = News.planetGetAnyNewsTargeting(planet, [NT.SUBJUGATION, ...NT_COOPERATION_PREVENTING]) || []
                eventsToEnd.concat(News.planetGetAnyNews(planet, [NT.SUBJUGATION, ...NT_COOPERATION_PREVENTING]) || [])
                for (const ev of eventsToEnd) {
                    ev.endAsap = true
                    if (ev.shouldEnd()) ev.end()
                }
                //we cant just set the relationships directly because it'll interfere with ongoing news, leave modifiers in a screwy state
                //instead, set all related news to expire immediately
            }
            if (targetPlanet && newRelationship) {
                culture.relationships.set(targetPlanet, newRelationship);
            }
            for (const [cargoType, modifier] of cargoPriceModifiers) {
                culture.cargoPriceModifiers.multiply(cargoType, modifier);
            }

            for (const building of buildingsDisabled) {
                building.enabled = false;
            }
            for (const building of buildingsEnabled) {
                building.enabled = true;
            }
        }

        if (planet && planet.settlement) {
            const {settlement} = planet
            if (credits !== 1.0) {
                for (const building of settlement.buildings) {
                    if (!building.baseCredits) continue
                    //console.log('1 altering credits for building by factor:',credits,'starting base credits:',building.baseCredits);
                    building.baseCredits = Math.max(1, rndRound(building.baseCredits * credits));
                    //console.log('2 altered credits for building by factor:',credits,'new base credits:',building.baseCredits);
                    building.normalize();
                    if (building.baseCredits > MARKET_AVERAGE_CREDITS*1000) {
                        console.log('building:',building,'this:',this)
                        console.log('WARNING!!!!!!!!!!!!! building has extremely high credits after modification:')
                    }
                }
            }
            if (guildNumOfficers !== 1.0) {
                settlement.guild.baseNumOfficers = Math.max(1, rndRound(settlement.guild.baseNumOfficers * guildNumOfficers))
                settlement.guild.normalize();
            }
            if (shipyardNumShips !== 1.0) {
                settlement.shipyard.baseNumShips = Math.max(1, rndRound(settlement.shipyard.baseNumShips * shipyardNumShips));
                settlement.shipyard.baseNumModules = Math.max(1, rndRound(settlement.shipyard.baseNumModules * shipyardNumShips));
                settlement.shipyard.normalize();
            }
            if (marketPrices !== 1.0) settlement.market.inflation *= marketPrices;
            if (blackMarketPrices !== 1.0) settlement.blackMarket.inflation *= blackMarketPrices;
            for (const ct of CARGO_TYPES_ALL) {
                if (marketCargoAmounts !== 1.0) settlement.market.baseCargo.setAmount(ct, Math.max(1, rndRound(settlement.market.baseCargo.getAmount(ct) * marketCargoAmounts)));
                if (blackMarketCargoAmounts !== 1.0) settlement.blackMarket.baseCargo.setAmount(ct, Math.max(1, rndRound(settlement.blackMarket.baseCargo.getAmount(ct) * blackMarketCargoAmounts)));
            }
            if (marketCargoAmounts !== 1.0) settlement.market.normalize()
            if (blackMarketCargoAmounts !== 1.0) settlement.blackMarket.normalize()
        }

        if (this.onApply) this.onApply();
    }

    getInverse() {
        const inverseEffect = new NewsEffect({
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            newGovernmentType: this.oldGovernmentType,
            newRelationship: null,
            onApply: null,
            //newRelationship: this.oldRelationship, //MUST be handled through onApply as relationships can evolve mid-event
            buildingsDisabled: this.buildingsEnabled,
            buildingsEnabled: this.buildingsDisabled,
            marketPrices: 1 / this.marketPrices,
            marketCargoAmounts: 1 / this.marketCargoAmounts,
            blackMarketPrices: 1 / this.blackMarketPrices,
            blackMarketCargoAmounts: 1 / this.blackMarketCargoAmounts,
            military: 1 / this.military,
            industry: 1 / this.industry,
            economy: 1 / this.economy,
            security: 1 / this.security,
            crime: 1 / this.crime,
            prestige: 1 / this.prestige,
            population: 1 / this.population,
            territory: 1 / this.territory,
            shipQuality: 1 / this.shipQuality,
            officerQuality: 1 / this.officerQuality,
            guildNumOfficers: 1/this.guildNumOfficers,
            shipyardNumShips: 1/this.shipyardNumShips,
            credits: 1 / this.credits,
            cargoPriceModifiers: NewsEffect.getInvertedCargoPriceModifiers(this.cargoPriceModifiers),
            relationsReset: false, //this cant be undone.
        });
        return inverseEffect
    }

    static getInvertedCargoPriceModifiers(cargoPriceModifiers = new Map()) {
        return new Map(Array.from(cargoPriceModifiers.entries()).map(([ct, mod]) => [ct, 1/mod]))
    }

    getHalfRegression() {
        const inversion = this.getInverse()
        //apply News.clHalfRegression to every numeric value
        Object.assign(inversion, {
            marketPrices: News.clHalfRegression(inversion.marketPrices),
            marketCargoAmounts: News.clHalfRegression(inversion.marketCargoAmounts),
            blackMarketPrices: News.clHalfRegression(inversion.blackMarketPrices),
            blackMarketCargoAmounts: News.clHalfRegression(inversion.blackMarketCargoAmounts),
            military: News.clHalfRegression(inversion.military),
            industry: News.clHalfRegression(inversion.industry),
            economy: News.clHalfRegression(inversion.economy),
            security: News.clHalfRegression(inversion.security),
            crime: News.clHalfRegression(inversion.crime),
            prestige: News.clHalfRegression(inversion.prestige),
            population: News.clHalfRegression(inversion.population),
            territory: News.clHalfRegression(inversion.territory),
            shipQuality: News.clHalfRegression(inversion.shipQuality),
            officerQuality: News.clHalfRegression(inversion.officerQuality),
            shipyardNumShips: News.clHalfRegression(inversion.shipyardNumShips),
            guildNumOfficers: News.clHalfRegression(inversion.guildNumOfficers),
            credits: News.clHalfRegression(inversion.credits),
        })
        return inversion            
    }

    clone() {
        return new NewsEffect({
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            newGovernmentType: this.newGovernmentType,
            newRelationship: this.newRelationship,
            marketPrices: this.marketPrices,
            marketCargoAmounts: this.marketCargoAmounts,
            blackMarketPrices: this.blackMarketPrices,
            blackMarketCargoAmounts: this.blackMarketCargoAmounts,
            military: this.military,
            industry: this.industry,
            economy: this.economy,
            security: this.security,
            crime: this.crime,
            prestige: this.prestige,
            population: this.population,
            territory: this.territory,
            shipQuality: this.shipQuality,
            officerQuality: this.officerQuality,
            buildingsDisabled: [...this.buildingsDisabled],
            buildingsEnabled: [...this.buildingsEnabled],
            shipyardNumShips: this.shipyardNumShips,
            guildNumOfficers: this.guildNumOfficers,
            cargoPriceModifiers: new Map(this.cargoPriceModifiers),
            credits: this.credits,
            relationsReset: this.relationsReset,
            forcePeace: this.forcePeace,
            forceWithdrawal: this.forceWithdrawal,
            onApply: this.onApply,
        });
    }

    describe() {
        function dscr(label = '', rating = 1.0, newRating = 1.0, invertColor = false) {
            return `${label}: ${describeRating(rating, invertColor)} ➜ ${describeRating(newRating, invertColor)}.<br/>`
        }

        const {planet, targetPlanet, military, newGovernmentType, newRelationship, credits, 
            blackMarketCargoAmounts, blackMarketPrices, buildingsDisabled, buildingsEnabled, territory,
            population, crime, marketPrices, security, economy, 
            guildNumOfficers, industry, shipyardNumShips, marketCargoAmounts,
            shipQuality, officerQuality, relationsReset, prestige, cargoPriceModifiers, forcePeace} = this;
        
        let msg = ''
        
        if (planet && planet.culture) {
            const {culture} = planet
            if (newGovernmentType) msg += `- GovernmentType: ${coloredName(culture.governmentType)} ➜ ${coloredName(newGovernmentType)}.<br/>`
            if (relationsReset) msg += `- All relationships reset to neutral.<br/>`
            if (forcePeace) msg += `- All hostilities towards this planet have ceased.<br/>`
            if (this.forceWithdrawal) msg += `- All interactions with other planets have ceased.<br/>`
            if (targetPlanet && newRelationship) {
                msg += `- Relationship with ${coloredName(targetPlanet)}: ${coloredName(culture.relationships.get(targetPlanet))} ➜ ${coloredName(newRelationship)}.<br/>`
            }


            for (const building of buildingsDisabled) {
                msg += `${colorSpan(`- ${building.buildingType.name} destroyed`, COLORS.Red)}<br/>`
            }
            for (const building of buildingsEnabled) {
                msg += `${colorSpan(`- ${building.buildingType.name} built`, COLORS.Green)}<br/>`
            }

            for (const [cargoType, modifier] of cargoPriceModifiers.entries()) {
                msg += `- Demand for ${cargoType.name}: ${culture.cargoPriceModifiers.getAmount(cargoType)}x ➜ ${culture.cargoPriceModifiers.getAmount(cargoType)*modifier}x.<br/>`
            }

            if (population !== 1.0) msg += `- Population: ${describePopulation(culture.population)} ➜ ${describePopulation(culture.population*population)}.<br/>`
            if (territory !== 1.0) msg += `- Territory: ${describeTerritory(culture.territory)} ➜ ${describeTerritory(culture.territory*territory)}.<br/>`
            if (prestige !== 1.0) msg += dscr('- Prestige', culture.prestige, culture.prestige*prestige)
            if (military !== 1.0) msg += dscr('- GovernmentType', culture.military, culture.military*military)
            if (industry !== 1.0) msg += dscr('- Industrial', culture.industry, culture.industry*industry)
            if (economy !== 1.0) msg += dscr('- Economic', culture.economy, culture.economy*economy)
            if (security !== 1.0) msg += dscr('- Security', culture.security, culture.security*security)
            if (crime !== 1.0) msg += dscr('- Crime', culture.crime, culture.crime*crime, true)
            if (shipQuality !== 1.0) msg += dscr('- Ships', culture.shipQuality, culture.shipQuality*shipQuality)
            if (officerQuality !== 1.0) msg += dscr('- Officers', culture.officerQuality, culture.officerQuality*officerQuality)

        }

        if (planet && planet.settlement) {
            const {settlement} = planet
            if (credits !== 1.0) {
                msg += `- Bank Credits: ${settlement.bank.baseCredits} ➜ ${settlement.bank.baseCredits*credits}.<br/>`
            }
            if (guildNumOfficers) {
                msg += `- Guild Officers: ${settlement.guild.baseNumOfficers} ➜ ${Math.round(settlement.guild.baseNumOfficers * guildNumOfficers)}.<br/>`
            }
            if (shipyardNumShips) {
                msg += `- Shipyard Ships: ${settlement.shipyard.baseNumShips} ➜ ${Math.round(settlement.shipyard.baseNumShips * shipyardNumShips)}.<br/>`
            }
            if (marketCargoAmounts) {
                msg += `- Market Units Per Cargo Type: ${settlement.market.baseCargo.average} ➜ ${settlement.market.baseCargo.average * marketCargoAmounts}.<br/>`
            }
            if (marketCargoAmounts) {
                msg += `- Market Prices: ${settlement.market.inflation}x ➜ ${settlement.market.inflation * marketPrices}x.<br/>`
            }
            if (blackMarketCargoAmounts) {
                msg += `- Black Market Units Per Cargo Type: ${settlement.blackMarket.baseCargo.average} ➜ ${settlement.blackMarket.baseCargo.average * blackMarketCargoAmounts}.<br/>`
            }
            if (blackMarketPrices) {
                msg += `- Black Market Prices: ${settlement.blackMarket.inflation}x ➜ ${settlement.blackMarket.inflation * blackMarketPrices}x.<br/>`
            }
        }

        return msg
   }
}