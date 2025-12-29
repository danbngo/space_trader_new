
/**
 * Represents the effects a news event has on a planet's civilization, economy, and relationships.
 * @class NewsEffect
 */
class NewsEffect {
    /**
     * @param {Object} params - The effect parameters.
     * @param {Planet} [params.planet] - The planet affected.
     * @param {Planet|null} [params.targetPlanet] - The target planet for relationship changes.
     * @param {GovernmentType|null} [params.newGovernmentType] - New government type to change to.
     * @param {RelationshipType|null} [params.newRelationship] - New relationship with target planet.
     * @param {number} [params.inflation] - Multiplier for market prices (inflation).
     * @param {number} [params.stockpile] - Multiplier for market cargo quantities.
     * @param {number} [params.corruption] - Multiplier for black market prices.
     * @param {number} [params.crime] - Multiplier for black market cargo quantities.
     * @param {number} [params.military] - Multiplier for military rating.
     * @param {number} [params.industry] - Multiplier for industrial rating.
     * @param {number} [params.economy] - Multiplier for commercial rating.
     * @param {number} [params.security] - Multiplier for security rating.
     * @param {number} [params.culture] - Multiplier for culture rating.
     * @param {number} [params.prestige] - Multiplier for prestige rating.
     * @param {number} [params.population] - Multiplier for population.
     * @param {number} [params.territory] - Multiplier for territory.
     * @param {number} [params.technology] - Multiplier for ship quality.
     * @param {number} [params.education] - Multiplier for officer quality.
     * @param {Building[]} [params.buildingsDisabled] - Buildings to disable.
     * @param {Building[]} [params.buildingsEnabled] - Buildings to enable.
     * @param {number} [params.ships] - Multiplier for shipyard inventory.
     * @param {number} [params.labor] - Multiplier for guild officer availability.
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
        inflation = 1.0,
        stockpile = 1.0,
        corruption = 1.0,
        crime = 1.0,
        
        // Civilization rating changes
        military = 1.0,
        industry = 1.0,
        economy = 1.0,
        security = 1.0,
        culture = 1.0,
        prestige = 1.0,
        
        // Population and territory changes
        population = 1.0,
        territory = 1.0,

        // tech changes
        technology = 1.0,
        education = 1.0,
        
        // Building changes
        buildingsDisabled = [],
        buildingsEnabled = [],
        
        // Shipyard changes
        ships = 1.0,
        
        // Guild changes
        labor = 1.0,

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
        this.oldGovernmentType = planet && planet.civilization ? planet.civilization.governmentType : null;
        /** @type {GovernmentType|null} */
        this.newGovernmentType = newGovernmentType;
        /** @type {RelationshipType|null} */
        this.oldRelationship = planet && planet.civilization ? planet.civilization.relationships.get(targetPlanet) || null : null;
        /** @type {RelationshipType|null} */
        this.newRelationship = newRelationship;
        /** @type {number} */
        this.inflation = inflation;
        /** @type {number} */
        this.stockpile = stockpile;
        /** @type {number} */
        this.corruption = corruption;
        /** @type {number} */
        this.crime = crime;
        /** @type {number} */
        this.military = military;
        /** @type {number} */
        this.industry = industry;
        /** @type {number} */
        this.economy = economy;
        /** @type {number} */
        this.security = security;
        /** @type {number} */
        this.culture = culture;
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
        this.labor = labor;
        /** @type {number} */
        this.ships = ships;
        /** @type {number} */
        this.credits = credits;
        /** @type {number} */
        this.technology = technology;
        /** @type {number} */
        this.education = education;
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
            crime, corruption, buildingsDisabled, buildingsEnabled, territory,
            population, culture, inflation, security, economy, 
            labor, industry, ships, stockpile, fired,
            technology, education, relationsReset, forcePeace, forceWithdrawal, prestige, cargoPriceModifiers} = this;

        this.fired = true;

        if (planet && planet.civilization) {
            const {civilization} = planet
            civilization.governmentType = newGovernmentType || civilization.governmentType;
            civilization.technology *= technology;
            civilization.education *= education;
            civilization.military *= military;
            civilization.industry *= industry;
            civilization.economy *= economy;
            civilization.security *= security;
            civilization.culture *= culture;
            civilization.prestige *= prestige;
            civilization.population *= population;
            civilization.territory *= territory;
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
                civilization.relationships.set(targetPlanet, newRelationship);
            }
            for (const [cargoType, modifier] of cargoPriceModifiers) {
                civilization.cargoPriceModifiers.multiply(cargoType, modifier);
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
            if (labor !== 1.0) {
                settlement.guild.baseNumOfficers = Math.max(1, rndRound(settlement.guild.baseNumOfficers * labor))
                settlement.guild.normalize();
            }
            if (ships !== 1.0) {
                settlement.shipyard.baseNumShips = Math.max(1, rndRound(settlement.shipyard.baseNumShips * ships));
                settlement.shipyard.baseNumModules = Math.max(1, rndRound(settlement.shipyard.baseNumModules * ships));
                settlement.shipyard.normalize();
            }
            if (inflation !== 1.0) settlement.market.inflation *= inflation;
            if (corruption !== 1.0) settlement.blackMarket.inflation *= 1/corruption; //corruption works IN REVERSE on prices
            for (const ct of CARGO_TYPES_ALL) {
                if (stockpile !== 1.0) settlement.market.baseCargo.setAmount(ct, Math.max(1, rndRound(settlement.market.baseCargo.getAmount(ct) * stockpile)));
                if (crime !== 1.0) settlement.blackMarket.baseCargo.setAmount(ct, Math.max(1, rndRound(settlement.blackMarket.baseCargo.getAmount(ct) * crime)));
            }
            if (stockpile !== 1.0) settlement.market.normalize()
            if (crime !== 1.0) settlement.blackMarket.normalize()
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
            inflation: 1 / this.inflation,
            stockpile: 1 / this.stockpile,
            corruption: 1 / this.corruption,
            crime: 1 / this.crime,
            military: 1 / this.military,
            industry: 1 / this.industry,
            economy: 1 / this.economy,
            security: 1 / this.security,
            culture: 1 / this.culture,
            prestige: 1 / this.prestige,
            population: 1 / this.population,
            territory: 1 / this.territory,
            technology: 1 / this.technology,
            education: 1 / this.education,
            labor: 1/this.labor,
            ships: 1/this.ships,
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
            inflation: News.clHalfRegression(inversion.inflation),
            stockpile: News.clHalfRegression(inversion.stockpile),
            corruption: News.clHalfRegression(inversion.corruption),
            crime: News.clHalfRegression(inversion.crime),
            military: News.clHalfRegression(inversion.military),
            industry: News.clHalfRegression(inversion.industry),
            economy: News.clHalfRegression(inversion.economy),
            security: News.clHalfRegression(inversion.security),
            culture: News.clHalfRegression(inversion.culture),
            prestige: News.clHalfRegression(inversion.prestige),
            population: News.clHalfRegression(inversion.population),
            territory: News.clHalfRegression(inversion.territory),
            technology: News.clHalfRegression(inversion.technology),
            education: News.clHalfRegression(inversion.education),
            ships: News.clHalfRegression(inversion.ships),
            labor: News.clHalfRegression(inversion.labor),
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
            inflation: this.inflation,
            stockpile: this.stockpile,
            corruption: this.corruption,
            crime: this.crime,
            military: this.military,
            industry: this.industry,
            economy: this.economy,
            security: this.security,
            culture: this.culture,
            prestige: this.prestige,
            population: this.population,
            territory: this.territory,
            technology: this.technology,
            education: this.education,
            buildingsDisabled: [...this.buildingsDisabled],
            buildingsEnabled: [...this.buildingsEnabled],
            ships: this.ships,
            labor: this.labor,
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
            crime, corruption, buildingsDisabled, buildingsEnabled, territory,
            population, culture, inflation, security, economy, 
            labor, industry, ships, stockpile,
            technology, education, relationsReset, prestige, cargoPriceModifiers, forcePeace} = this;
        
        let msg = ''
        
        if (planet && planet.civilization) {
            const {civilization} = planet
            if (newGovernmentType) msg += `- GovernmentType: ${coloredName(civilization.governmentType)} ➜ ${coloredName(newGovernmentType)}.<br/>`
            if (relationsReset) msg += `- All relationships reset to neutral.<br/>`
            if (forcePeace) msg += `- All hostilities towards this planet have ceased.<br/>`
            if (this.forceWithdrawal) msg += `- All interactions with other planets have ceased.<br/>`
            if (targetPlanet && newRelationship) {
                msg += `- Relationship with ${coloredName(targetPlanet)}: ${coloredName(civilization.relationships.get(targetPlanet))} ➜ ${coloredName(newRelationship)}.<br/>`
            }


            for (const building of buildingsDisabled) {
                msg += `${colorSpan(`- ${building.buildingType.name} destroyed`, COLORS.Red)}<br/>`
            }
            for (const building of buildingsEnabled) {
                msg += `${colorSpan(`- ${building.buildingType.name} built`, COLORS.Green)}<br/>`
            }

            for (const [cargoType, modifier] of cargoPriceModifiers.entries()) {
                msg += `- Demand for ${cargoType.name}: ${civilization.cargoPriceModifiers.getAmount(cargoType)}x ➜ ${civilization.cargoPriceModifiers.getAmount(cargoType)*modifier}x.<br/>`
            }

            if (population !== 1.0) msg += `- Population: ${describePopulation(civilization.population)} ➜ ${describePopulation(civilization.population*population)}.<br/>`
            if (territory !== 1.0) msg += `- Territory: ${describeTerritory(civilization.territory)} ➜ ${describeTerritory(civilization.territory*territory)}.<br/>`
            if (prestige !== 1.0) msg += dscr('- Prestige', civilization.prestige, civilization.prestige*prestige)
            if (military !== 1.0) msg += dscr('- GovernmentType', civilization.military, civilization.military*military)
            if (industry !== 1.0) msg += dscr('- Industrial', civilization.industry, civilization.industry*industry)
            if (economy !== 1.0) msg += dscr('- Economic', civilization.economy, civilization.economy*economy)
            if (security !== 1.0) msg += dscr('- Security', civilization.security, civilization.security*security)
            if (culture !== 1.0) msg += dscr('- Crime', civilization.culture, civilization.culture*culture, true)
            if (technology !== 1.0) msg += dscr('- Ships', civilization.technology, civilization.technology*technology)
            if (education !== 1.0) msg += dscr('- Officers', civilization.education, civilization.education*education)

        }

        if (planet && planet.settlement) {
            const {settlement} = planet
            if (credits !== 1.0) {
                msg += `- Bank Credits: ${settlement.bank.baseCredits} ➜ ${settlement.bank.baseCredits*credits}.<br/>`
            }
            if (labor) {
                msg += `- Guild Officers: ${settlement.guild.baseNumOfficers} ➜ ${Math.round(settlement.guild.baseNumOfficers * labor)}.<br/>`
            }
            if (ships) {
                msg += `- Shipyard Ships: ${settlement.shipyard.baseNumShips} ➜ ${Math.round(settlement.shipyard.baseNumShips * ships)}.<br/>`
            }
            if (stockpile) {
                msg += `- Market Units Per Cargo Type: ${settlement.market.baseCargo.average} ➜ ${settlement.market.baseCargo.average * stockpile}.<br/>`
            }
            if (stockpile) {
                msg += `- Market Prices: ${settlement.market.inflation}x ➜ ${settlement.market.inflation * inflation}x.<br/>`
            }
            if (crime) {
                msg += `- Black Market Units Per Cargo Type: ${settlement.blackMarket.baseCargo.average} ➜ ${settlement.blackMarket.baseCargo.average * crime}.<br/>`
            }
            if (corruption) {
                msg += `- Black Market Prices: ${settlement.blackMarket.inflation}x ➜ ${settlement.blackMarket.inflation * corruption}x.<br/>`
            }
        }

        return msg
   }
}