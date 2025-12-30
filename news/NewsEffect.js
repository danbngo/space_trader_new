
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
     * @param {number} [params.reserves] - Multiplier for market cargo quantities.
     * @param {number} [params.corruption] - Multiplier for black market prices.
     * @param {number} [params.crime] - Multiplier for black market cargo quantities.
     * @param {number} [params.army] - Multiplier for army rating.
     * @param {number} [params.navy] - Multiplier for navy rating.
     * @param {number} [params.industry] - Multiplier for industrial rating.
     * @param {number} [params.economy] - Multiplier for commercial rating.
     * @param {number} [params.security] - Multiplier for security rating.
     * @param {number} [params.culture] - Multiplier for culture rating.
     * @param {number} [params.prestige] - Multiplier for prestige rating.
     * @param {number} [params.population] - Multiplier for population.
     * @param {number} [params.territory] - Multiplier for territory.
     * @param {number} [params.technology] - Multiplier for ship quality.
     * @param {number} [params.education] - Multiplier for officer quality.
     * @param {number} [params.wealth] - More credits in each building
     * @param {Building[]} [params.buildingsDisabled] - Buildings to disable.
     * @param {Building[]} [params.buildingsEnabled] - Buildings to enable.
     * @param {Map<CargoType, number>} [params.cargoPriceModifiers] - Cargo-specific price modifiers.
     * @param {Map<SkillType, number>} [params.skillPriceModifiers] - Skill experience modifiers.
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
        reserves = 1.0,
        crime = 1.0,
        corruption = 1.0,
        
        // Civilization rating changes
        army = 1.0,
        navy = 1.0,
        industry = 1.0,
        economy = 1.0,
        security = 1.0,
        culture = 1.0,
        prestige = 1.0,
        wealth = 1.0,
        
        // Population and territory changes
        population = 1.0,
        territory = 1.0,

        // tech changes
        technology = 1.0,
        education = 1.0,
        
        // Building changes
        buildingsDisabled = [],
        buildingsEnabled = [],
        
        //Market and black market changes
        cargoPriceModifiers = new Map(),
        skillPriceModifiers = new Map(),

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
        this.reserves = reserves;
        /** @type {number} */
        this.corruption = corruption;
        /** @type {number} */
        this.crime = crime;
        /** @type {number} */
        this.corruption = corruption;
        /** @type {number} */
        this.army = army;
        /** @type {number} */
        this.navy = navy;
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
        /** @type {number} */
        this.wealth = wealth;
        /** @type {Building[]} */
        this.buildingsDisabled = buildingsDisabled;
        /** @type {Building[]} */
        this.buildingsEnabled = buildingsEnabled;
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
        /** @type {Map<SkillType, number>} */
        this.skillPriceModifiers = skillPriceModifiers;
        /** @type {function(): void} */
        this.onApply = onApply //use sparingly!
        this.fired = false;
    }

    apply(elapsedYears = 0) {
        const {planet, targetPlanet, army, navy, newGovernmentType, newRelationship, 
            buildingsDisabled, buildingsEnabled, territory, skillPriceModifiers,
            population, culture, inflation, security, economy, 
            industry, reserves, fired, crime, corruption, wealth,
            technology, education, relationsReset, forcePeace, forceWithdrawal, prestige, cargoPriceModifiers} = this;

        this.fired = true;

        if (planet && planet.civilization) {
            const {civilization} = planet
            civilization.governmentType = newGovernmentType || civilization.governmentType;
            civilization.technology *= technology;
            civilization.education *= education;
            civilization.army *= army;
            civilization.navy *= navy;
            civilization.industry *= industry;
            civilization.economy *= economy;
            civilization.security *= security;
            civilization.culture *= culture;
            civilization.prestige *= prestige;
            civilization.population *= population;
            civilization.territory *= territory;
            civilization.crime *= crime;
            civilization.corruption *= corruption;
            civilization.wealth *= wealth;
            civilization.reserves *= reserves;
            civilization.inflation *= inflation;
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
            for (const [skillType, modifier] of skillPriceModifiers) {
                civilization.skillPriceModifiers.multiply(skillType, modifier)
            }
            for (const building of buildingsDisabled) {
                building.enabled = false;
            }
            for (const building of buildingsEnabled) {
                building.enabled = true;
            }
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
            reserves: 1 / this.reserves,
            corruption: 1 / this.corruption,
            crime: 1 / this.crime,
            army: 1 / this.army,
            navy: 1 / this.navy,
            industry: 1 / this.industry,
            economy: 1 / this.economy,
            security: 1 / this.security,
            culture: 1 / this.culture,
            prestige: 1 / this.prestige,
            population: 1 / this.population,
            territory: 1 / this.territory,
            technology: 1 / this.technology,
            education: 1 / this.education,
            wealth: 1 / this.wealth,
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
            reserves: News.clHalfRegression(inversion.reserves),
            corruption: News.clHalfRegression(inversion.corruption),
            crime: News.clHalfRegression(inversion.crime),
            army: News.clHalfRegression(inversion.army),
            navy: News.clHalfRegression(inversion.navy),
            industry: News.clHalfRegression(inversion.industry),
            economy: News.clHalfRegression(inversion.economy),
            security: News.clHalfRegression(inversion.security),
            culture: News.clHalfRegression(inversion.culture),
            prestige: News.clHalfRegression(inversion.prestige),
            population: News.clHalfRegression(inversion.population),
            territory: News.clHalfRegression(inversion.territory),
            technology: News.clHalfRegression(inversion.technology),
            education: News.clHalfRegression(inversion.education),
            wealth: News.clHalfRegression(inversion.wealth),
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
            reserves: this.reserves,
            corruption: this.corruption,
            crime: this.crime,
            army: this.army,
            navy: this.navy,
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
            cargoPriceModifiers: new Map(this.cargoPriceModifiers),
            skillPriceModifiers: new Map(this.skillPriceModifiers),
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

        const {planet, targetPlanet, army, navy, newGovernmentType, newRelationship, reserves, 
            crime, corruption, buildingsDisabled, buildingsEnabled, territory,
            population, culture, inflation, security, economy, industry, wealth,
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
            if (security !== 1.0) msg += dscr('- Security', civilization.security, civilization.security*security)
            if (economy !== 1.0) msg += dscr('- Economy', civilization.economy, civilization.economy*economy)
            if (industry !== 1.0) msg += dscr('- Industry', civilization.industry, civilization.industry*industry)
            if (culture !== 1.0) msg += dscr('- Culture', civilization.culture, civilization.culture*culture, true)
            if (technology !== 1.0) msg += dscr('- Technology', civilization.technology, civilization.technology*technology)
            if (education !== 1.0) msg += dscr('- Education', civilization.education, civilization.education*education)
            if (wealth !== 1.0) msg += dscr('- Wealth', civilization.wealth, civilization.wealth*wealth)
            if (reserves !== 1.0) msg += dscr('- Reserves', civilization.reserves, civilization.reserves*reserves)
            if (inflation !== 1.0) msg += dscr('- Inflation', civilization.inflation, civilization.inflation*inflation, true)
            if (army !== 1.0) msg += dscr('- Army', civilization.army, civilization.army*army)
            if (navy !== 1.0) msg += dscr('- Navy', civilization.navy, civilization.navy*navy)
            if (crime !== 1.0) msg += dscr('- Crime', civilization.crime, civilization.crime*crime, true)
            if (corruption !== 1.0) msg += dscr('- Corruption', civilization.corruption, civilization.corruption*corruption, true)

        }
        return msg
   }
}