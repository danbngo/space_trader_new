
/**
 * @typedef {CivilizationParams & {
 *   targetPlanet?: Planet|null,
 *   newRelationship?: RelationshipType|null,
 *   buildingsDisabled?: Building[],
 *   buildingsEnabled?: Building[],
 *   relationsReset?: boolean,
 *   forcePeace?: boolean,
 *   forceWithdrawal?: boolean,
 *   onApply?: function(number): void
 * }} NewsEffectParams - The effect parameters extending CivilizationParams with additional NewsEffect-specific properties.
 */

/**
 * Represents the effects a news event has on a planet's civilization, economy, and relationships.
 * @class NewsEffect
 */
class NewsEffect extends Civilization {
    /**
     * @param {NewsEffectParams} params - The effect parameters.
     */
    constructor({
        planet = null,
        targetPlanet = null,
        governmentType = null,
        newRelationship = null,
        buildingsDisabled = [],
        buildingsEnabled = [],
        relationsReset = false,
        forcePeace = false,
        forceWithdrawal = false,
        onApply = ()=>{},
        cargoPriceMultipliers = new CountsMap(),
        skillPriceMultipliers = new CountsMap(),
        technology = 1.0,
        education = 1.0,
        territory = 1,
        population = 1,
        industry = 1,
        economy = 1,
        security = 1,
        culture = 1,
        prestige = 1,
        policies = new Policies(),
        navy = 1,
        army = 1,
        corruption = 1,
        crime = 1,
        wealth = 1,
        reserves = 1,
        inflation = 1,
        taxes = 1,
        religions = new CountsMap()

    }) {
        super({
            cargoPriceMultipliers,
            skillPriceMultipliers,
            technology,
            education,
            territory,
            population,
            industry,
            economy,
            security,
            culture,
            prestige,
            policies,
            navy,
            army,
            corruption,
            crime,
            wealth,
            reserves,
            inflation,  
            taxes,
            religions
        });

        /** @type {Planet|null} */
        this.targetPlanet = targetPlanet;
        /** @type {GovernmentType} */
        this.oldGovernmentType = planet && planet.civilization ? planet.civilization.governmentType : null;
        /** @type {GovernmentType|null} */
        this.governmentType = governmentType;
        /** @type {RelationshipType|null} */
        this.oldRelationship = planet && planet.civilization ? planet.civilization.relationships.get(targetPlanet) || null : null;
        /** @type {RelationshipType|null} */
        this.newRelationship = newRelationship;
        /** @type {Building[]} */
        this.buildingsDisabled = buildingsDisabled;
        /** @type {Building[]} */
        this.buildingsEnabled = buildingsEnabled;
        /** @type {boolean} */
        this.relationsReset = relationsReset;
        /** @type {boolean} */
        this.forcePeace = forcePeace;
        /** @type {boolean} */
        this.forceWithdrawal = forceWithdrawal;
        /** @type {function(number): void} */
        this.onApply = onApply //use sparingly!
        this.fired = false;
    }

    apply(elapsedYears = 0) {
        const {planet, targetPlanet, governmentType, newRelationship, 
            buildingsDisabled, buildingsEnabled, relationsReset, forcePeace, forceWithdrawal, onApply} = this;
        this.fired = true;

        if (planet && planet.civilization) {
            const {civilization} = planet
            civilization.governmentType = governmentType || civilization.governmentType;

            civilization.multiply(this);
           
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
            for (const building of buildingsDisabled) {
                building.enabled = false;
            }
            for (const building of buildingsEnabled) {
                building.enabled = true;
            }
        }

        if (this.onApply) this.onApply(elapsedYears);
    }

    getInverse() {
        const inverseCivilization = new Civilization({...this})
        const inverseEffect = new NewsEffect({
            ...inverseCivilization,
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            governmentType: this.oldGovernmentType,
            newRelationship: null,
            onApply: null,
            //newRelationship: this.oldRelationship, //MUST be handled through onApply as relationships can evolve mid-event
            buildingsDisabled: this.buildingsEnabled,
            buildingsEnabled: this.buildingsDisabled,
            relationsReset: false, //this cant be undone.
        });
        return inverseEffect
    }

    clone() {
        const newCiv = new Civilization({...this});
        return new NewsEffect({
            ...newCiv,
            planet: this.planet,
            targetPlanet: this.targetPlanet,
            governmentType: this.governmentType,
            newRelationship: this.newRelationship,
            buildingsDisabled: [...this.buildingsDisabled],
            buildingsEnabled: [...this.buildingsEnabled],
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

        const {planet, targetPlanet, governmentType, newRelationship, buildingsDisabled, buildingsEnabled,
            relationsReset, forcePeace} = this;
        
        let msg = ''
        
        if (planet && planet.civilization) {
            const {civilization} = planet
            const {reserves, army, navy, crime, corruption, territory, population, culture, inflation, security, economy, industry, wealth, technology, education, prestige, cargoPriceMultipliers, } = this
            if (governmentType) msg += `- GovernmentType: ${coloredName(civilization.governmentType)} ➜ ${coloredName(governmentType)}.<br/>`
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

            for (const [cargoType, modifier] of cargoPriceMultipliers.counts) {
                msg += `- Demand for ${cargoType.name}: ${civilization.cargoPriceMultipliers.getAmount(cargoType)}x ➜ ${civilization.cargoPriceMultipliers.getAmount(cargoType)*modifier}x.<br/>`
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