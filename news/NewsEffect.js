
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
     * @param {number} [params.marketPricesModifiedBy] - Multiplier for market prices (inflation).
     * @param {number} [params.marketCargoAmountsModifiedBy] - Multiplier for market cargo quantities.
     * @param {number} [params.blackMarketPricesModifiedBy] - Multiplier for black market prices.
     * @param {number} [params.blackMarketCargoAmountsModifiedBy] - Multiplier for black market cargo quantities.
     * @param {number} [params.militaryModifiedBy] - Multiplier for military rating.
     * @param {number} [params.industryModifiedBy] - Multiplier for industrial rating.
     * @param {number} [params.commerceModifiedBy] - Multiplier for commercial rating.
     * @param {number} [params.securityModifiedBy] - Multiplier for security rating.
     * @param {number} [params.crimeModifiedBy] - Multiplier for crime rating.
     * @param {number} [params.prestigeModifiedBy] - Multiplier for prestige rating.
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
        marketPricesModifiedBy = 1.0,
        marketCargoAmountsModifiedBy = 1.0,
        blackMarketPricesModifiedBy = 1.0,
        blackMarketCargoAmountsModifiedBy = 1.0,
        
        // Culture rating changes
        militaryModifiedBy = 1.0,
        industryModifiedBy = 1.0,
        commerceModifiedBy = 1.0,
        securityModifiedBy = 1.0,
        crimeModifiedBy = 1.0,
        prestigeModifiedBy = 1.0,
        
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
        this.marketPricesModifiedBy = marketPricesModifiedBy;
        /** @type {number} */
        this.marketCargoAmountsModifiedBy = marketCargoAmountsModifiedBy;
        /** @type {number} */
        this.blackMarketPricesModifiedBy = blackMarketPricesModifiedBy;
        /** @type {number} */
        this.blackMarketCargoAmountsModifiedBy = blackMarketCargoAmountsModifiedBy;
        /** @type {number} */
        this.militaryModifiedBy = militaryModifiedBy;
        /** @type {number} */
        this.industryModifiedBy = industryModifiedBy;
        /** @type {number} */
        this.commerceModifiedBy = commerceModifiedBy;
        /** @type {number} */
        this.securityModifiedBy = securityModifiedBy;
        /** @type {number} */
        this.crimeModifiedBy = crimeModifiedBy;
        /** @type {number} */
        this.prestigeModifiedBy = prestigeModifiedBy;
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
        /** @type {boolean} */
        this.forcePeace = forcePeace;
        /** @type {boolean} */
        this.forceWithdrawal = forceWithdrawal;
        /** @type {Map<CargoType, number>} */
        this.cargoPriceModifiers = cargoPriceModifiers;
        /** @type {function(number): void} */
        this.onApply = onApply //use sparingly!
        this.fired = false;
    }

    apply(elapsedYears = 0) {
        const {planet, targetPlanet, militaryModifiedBy, newGovernmentType, newRelationship, creditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeModifiedBy, marketPricesModifiedBy, securityModifiedBy, commerceModifiedBy, 
            guildNumOfficersModifiedBy, industryModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy, fired,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, forcePeace, forceWithdrawal, prestigeModifiedBy, cargoPriceModifiers} = this;

        this.fired = true;

        if (planet && planet.culture) {
            const {culture} = planet
            culture.governmentType = newGovernmentType || culture.governmentType;
            culture.shipQuality *= shipQualityModifiedBy;
            culture.officerQuality *= officerQualityModifiedBy;
            culture.military *= militaryModifiedBy;
            culture.industry *= industryModifiedBy;
            culture.commerce *= commerceModifiedBy;
            culture.security *= securityModifiedBy;
            culture.crime *= crimeModifiedBy;
            culture.prestige *= prestigeModifiedBy;
            culture.population *= populationModifiedBy;
            culture.territory *= territoryModifiedBy;
            //FIRST end any wars to let their endEffects run
            if (forcePeace) {
                News.forcePeace(planet)
            }
            if (forceWithdrawal) {
                News.forceWithdrawal(planet)
            }
            //THEN reset all relationships
            if (relationsReset) {
                const eventsToEnd = News.planetGetAnyNewsTargeting(planet, [NEWS_TYPES.SUBJUGATION, ...NEWS_TYPES_HOSTILE]) || []
                eventsToEnd.concat(News.planetGetAnyNews(planet, [NEWS_TYPES.SUBJUGATION, ...NEWS_TYPES_HOSTILE]) || [])
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
            if (creditsModifiedBy !== 1.0) {
                for (const building of settlement.buildings) {
                    if (!building.baseCredits) continue
                    //console.log('1 altering credits for building by factor:',creditsModifiedBy,'starting base credits:',building.baseCredits);
                    building.baseCredits = Math.max(1, rndRound(building.baseCredits * creditsModifiedBy));
                    //console.log('2 altered credits for building by factor:',creditsModifiedBy,'new base credits:',building.baseCredits);
                    building.normalize();
                    if (building.baseCredits > MARKET_AVERAGE_CREDITS*1000) {
                        console.log('building:',building,'this:',this)
                        throw new Error('WARNING!!!!!!!!!!!!! building has extremely high credits after modification:')
                    }
                }
            }
            if (guildNumOfficersModifiedBy !== 1.0) {
                settlement.guild.baseNumOfficers = rndRound(settlement.guild.baseNumOfficers * guildNumOfficersModifiedBy);
                settlement.guild.normalize();
            }
            if (shipyardNumShipsModifiedBy !== 1.0) {
                settlement.shipyard.baseNumShips = rndRound(settlement.shipyard.baseNumShips * shipyardNumShipsModifiedBy);
                settlement.shipyard.baseNumModules = rndRound(settlement.shipyard.baseNumModules * shipyardNumShipsModifiedBy);
                settlement.shipyard.normalize();
            }
            if (marketPricesModifiedBy !== 1.0) settlement.market.inflation *= marketPricesModifiedBy;
            if (blackMarketPricesModifiedBy !== 1.0) settlement.blackMarket.inflation *= blackMarketPricesModifiedBy;
            for (const ct of CARGO_TYPES_ALL) {
                if (marketCargoAmountsModifiedBy !== 1.0) settlement.market.baseCargo.setAmount(ct, rndRound(settlement.market.baseCargo.getAmount(ct) * marketCargoAmountsModifiedBy));
                if (blackMarketCargoAmountsModifiedBy !== 1.0) settlement.blackMarket.baseCargo.setAmount(ct, rndRound(settlement.blackMarket.baseCargo.getAmount(ct) * blackMarketCargoAmountsModifiedBy));
            }
            if (marketCargoAmountsModifiedBy !== 1.0) settlement.market.normalize()
            if (blackMarketCargoAmountsModifiedBy !== 1.0) settlement.blackMarket.normalize()
        }

        if (this.onApply) this.onApply(elapsedYears);
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
            marketPricesModifiedBy: 1 / this.marketPricesModifiedBy,
            marketCargoAmountsModifiedBy: 1 / this.marketCargoAmountsModifiedBy,
            blackMarketPricesModifiedBy: 1 / this.blackMarketPricesModifiedBy,
            blackMarketCargoAmountsModifiedBy: 1 / this.blackMarketCargoAmountsModifiedBy,
            militaryModifiedBy: 1 / this.militaryModifiedBy,
            industryModifiedBy: 1 / this.industryModifiedBy,
            commerceModifiedBy: 1 / this.commerceModifiedBy,
            securityModifiedBy: 1 / this.securityModifiedBy,
            crimeModifiedBy: 1 / this.crimeModifiedBy,
            prestigeModifiedBy: 1 / this.prestigeModifiedBy,
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
        function dscr(label = '', rating = 1.0, newRating = 1.0, invertColor = false) {
            return `${label}: ${describeRating(rating, invertColor)} ➜ ${describeRating(newRating, invertColor)}.<br/>`
        }

        const {planet, targetPlanet, militaryModifiedBy, newGovernmentType, newRelationship, creditsModifiedBy, 
            blackMarketCargoAmountsModifiedBy, blackMarketPricesModifiedBy, buildingsDisabled, buildingsEnabled, territoryModifiedBy,
            populationModifiedBy, crimeModifiedBy, marketPricesModifiedBy, securityModifiedBy, commerceModifiedBy, 
            guildNumOfficersModifiedBy, industryModifiedBy, shipyardNumShipsModifiedBy, marketCargoAmountsModifiedBy,
            shipQualityModifiedBy, officerQualityModifiedBy, relationsReset, prestigeModifiedBy, cargoPriceModifiers, forcePeace} = this;
        
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
            if (prestigeModifiedBy !== 1.0) msg += dscr('- Prestige', culture.prestige, culture.prestige*prestigeModifiedBy)
            if (militaryModifiedBy !== 1.0) msg += dscr('- GovernmentType', culture.military, culture.military*militaryModifiedBy)
            if (industryModifiedBy !== 1.0) msg += dscr('- Industrial', culture.industry, culture.industry*industryModifiedBy)
            if (commerceModifiedBy !== 1.0) msg += dscr('- Commercial', culture.commerce, culture.commerce*commerceModifiedBy)
            if (securityModifiedBy !== 1.0) msg += dscr('- Security', culture.security, culture.security*securityModifiedBy)
            if (crimeModifiedBy !== 1.0) msg += dscr('- Crime', culture.crime, culture.crime*crimeModifiedBy, true)
            if (shipQualityModifiedBy !== 1.0) msg += dscr('- Ships', culture.shipQuality, culture.shipQuality*shipQualityModifiedBy)
            if (officerQualityModifiedBy !== 1.0) msg += dscr('- Officers', culture.officerQuality, culture.officerQuality*officerQualityModifiedBy)

        }

        if (planet && planet.settlement) {
            const {settlement} = planet
            if (creditsModifiedBy !== 1.0) {
                msg += `- Bank Credits: ${settlement.bank.baseCredits} ➜ ${settlement.bank.baseCredits*creditsModifiedBy}.<br/>`
            }
            if (guildNumOfficersModifiedBy) {
                msg += `- Guild Officers: ${settlement.guild.baseNumOfficers} ➜ ${Math.round(settlement.guild.baseNumOfficers * guildNumOfficersModifiedBy)}.<br/>`
            }
            if (shipyardNumShipsModifiedBy) {
                msg += `- Shipyard Ships: ${settlement.shipyard.baseNumShips} ➜ ${Math.round(settlement.shipyard.baseNumShips * shipyardNumShipsModifiedBy)}.<br/>`
            }
            if (marketCargoAmountsModifiedBy) {
                msg += `- Market Units Per Cargo Type: ${settlement.market.baseCargo.average} ➜ ${settlement.market.baseCargo.average * marketCargoAmountsModifiedBy}.<br/>`
            }
            if (marketCargoAmountsModifiedBy) {
                msg += `- Market Prices: ${settlement.market.inflation}x ➜ ${settlement.market.inflation * marketPricesModifiedBy}x.<br/>`
            }
            if (blackMarketCargoAmountsModifiedBy) {
                msg += `- Black Market Units Per Cargo Type: ${settlement.blackMarket.baseCargo.average} ➜ ${settlement.blackMarket.baseCargo.average * blackMarketCargoAmountsModifiedBy}.<br/>`
            }
            if (blackMarketPricesModifiedBy) {
                msg += `- Black Market Prices: ${settlement.blackMarket.inflation}x ➜ ${settlement.blackMarket.inflation * blackMarketPricesModifiedBy}x.<br/>`
            }
        }

        return msg
   }
}