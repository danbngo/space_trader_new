/**
 * A building where cargo can be bought and sold.
 * @class Market
 * @extends {Building}
 */
class Market extends Building {
    /**
     * @param {Planet} planet - The planet this market is on.
     * @param {boolean} blackMarket - Whether this is a black market (illegal goods).
     */
    constructor(planet = new Planet(), blackMarket = false) {
        super(planet, BUILDING_TYPES.MARKET)
        /** @type {boolean} */
        this.blackMarket = blackMarket;
        /** @type {CountsMap} */
        this.cargo = new CountsMap();
        this.normalize()
    }

    normalize() {
        super.normalize()
        this.cargo = this.calcBaseCargo()
        //apply a bit of rng
        for (const cargoType of CARGO_TYPES_ALL) {
            const currentAmount = this.cargo.getAmount(cargoType)
            const variation = Math.round(currentAmount * 0.25)
            const newAmount = rng(currentAmount - variation, currentAmount + variation)
            this.cargo.setAmount(cargoType, newAmount)
        }
    }

    calcBaseCargo() {
        const baseCargo = new CountsMap()
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        for (const cargoType of CARGO_TYPES_ALL) {
            // Skip RELICS - they are never available in standard markets
            if (cargoType === CARGO_TYPES.RELICS) continue
            
            //simple supply and demand - as price goes up, availability goes down
            const baseAmount = Math.round(MARKET_AVERAGE_CARGO_PER_TYPE/this.planet.c.cargoPriceMultipliers.getAmount(cargoType))
            const availabilityCalc = this.calcCargoAvailabilityModifier(cargoType)
            const availabilityModifier = availabilityCalc.getTotalMultiplier()
            const amount = this.blackMarket 
                ? baseAmount * this.planet.c.crime * availabilityModifier * this.level * multiplier
                : baseAmount * this.planet.c.reserves * availabilityModifier * this.level * multiplier
            baseCargo.setAmount(cargoType, amount)
        }
        return baseCargo
    }

    calcCargoAvailabilityModifier(ct = CARGO_TYPES_ALL[0]) {
        const calc = new Calculation();
        const civ = this.planet.civilization
        
        // Base availability
        calc.addFactor('base', 1.0);
        
        // Apply planet type modifiers from cargoModifiers map
        const planetType = this.planet.planetType;
        if (planetType && planetType.cargoModifiers.has(ct)) {
            calc.addFactor(planetType.name.toLowerCase(), planetType.cargoModifiers.get(ct));
        }
        
        // Apply atmosphere type modifiers
        const atmosphereType = this.planet.climate.atmosphereType;
        if (atmosphereType && atmosphereType.cargoModifiers.has(ct)) {
            calc.addFactor(atmosphereType.name.toLowerCase(), atmosphereType.cargoModifiers.get(ct));
        }
        
        // Apply geology type modifiers
        const geologyType = this.planet.climate.geologyType;
        if (geologyType && geologyType.cargoModifiers.has(ct)) {
            calc.addFactor(geologyType.name.toLowerCase(), geologyType.cargoModifiers.get(ct));
        }
        
        // Apply ocean type modifiers
        const oceanType = this.planet.climate.oceanType;
        if (oceanType && oceanType.cargoModifiers.has(ct)) {
            calc.addFactor(oceanType.name.toLowerCase(), oceanType.cargoModifiers.get(ct));
        }
        
        // Each cargo type has different production/availability based on civilization attributes
        if (ct == CARGO_TYPES.FOOD) {
            // Food production based on territory, population, and economy
            calc.addFactor('territory', 0.5 + civ.territory * 0.8);
            calc.addFactor('economy', 0.5 + civ.economy * 0.5);
        }
        else if (ct == CARGO_TYPES.METAL) {
            // Industrial planets produce more metal
            calc.addFactor('industry', 0.5 + civ.industry * 1.8);
            calc.addFactor('economy', 0.5 + civ.economy * 0.5);
        }
        else if (ct == CARGO_TYPES.WATER) {
            // Water availability based on reserves and infrastructure
            calc.addFactor('reserves', 0.5 + civ.reserves * 1.5);
            calc.addFactor('territory', 0.5 + civ.territory * 0.3);
        }
        else if (ct == CARGO_TYPES.ISOTOPES) {
            // Scientific production - high tech civilizations produce isotopes
            calc.addFactor('technology', 0.3 + civ.technology * 1.5);
            calc.addFactor('industry', 0.7 + civ.industry * 0.8);
        }
        else if (ct == CARGO_TYPES.NANITES) {
            // Advanced manufacturing product
            calc.addFactor('technology', 0.3 + civ.technology * 1.2);
            calc.addFactor('industry', 0.7 + civ.industry * 1.0);
            calc.addFactor('economy', 0.5 + civ.economy * 0.5);
        }
        else if (ct == CARGO_TYPES.MEDICINE) {
            // Medical production - education, wealth, and technology
            calc.addFactor('education', 0.4 + civ.education * 1.2);
            calc.addFactor('wealth', 0.6 + civ.wealth * 0.8);
            calc.addFactor('technology', 0.5 + civ.technology * 0.5);
        }
        else if (ct == CARGO_TYPES.HOLOCUBES) {
            // Entertainment production - culture and economy
            calc.addFactor('culture', 0.3 + civ.culture * 1.8);
            calc.addFactor('economy', 0.7 + civ.economy * 0.7);
            calc.addFactor('wealth', 0.5 + civ.wealth * 0.5);
        }
        else if (ct == CARGO_TYPES.WEAPONS) {
            // Illegal - black market availability
            calc.addFactor('crime', 0.3 + civ.crime * 2.0);
            calc.addFactor('army', 0.7 + civ.army * 1.2);
            calc.addFactor('corruption', 0.3 + civ.corruption * 1.0);
            calc.addFactor('low security', 1.0 / Math.max(0.5, civ.security));
        }
        else if (ct == CARGO_TYPES.DRUGS) {
            // Illegal - crime and corruption enable drug production/trade
            calc.addFactor('crime', 0.2 + civ.crime * 2.5);
            calc.addFactor('corruption', 0.5 + civ.corruption * 1.5);
            calc.addFactor('low security', 1.0 / Math.max(0.5, civ.security));
            calc.addFactor('low education', 1.0 / Math.max(0.5, civ.education));
        }
        else if (ct == CARGO_TYPES.ANTIMATTER) {
            // Highly restricted - only high tech military civilizations
            calc.addFactor('navy', 0.2 + civ.navy * 1.5);
            calc.addFactor('technology', 0.5 + civ.technology * 1.5);
            calc.addFactor('wealth', 0.5 + civ.wealth * 0.5);
        }
        
        return calc;
    }

    calcCargoPriceModifier(ct = CARGO_TYPES_ALL[0]) {
        const calc = new Calculation();
        const civ = this.planet.civilization
        
        // Availability affects price (inverse relationship - low availability = high price)
        const availabilityCalc = this.calcCargoAvailabilityModifier(ct);
        const availabilityMultiplier = availabilityCalc.getTotalMultiplier();
        // Invert availability: low availability (0.5x) = high price (2x)
        calc.addFactor('availability', 1.0 / Math.max(0.1, availabilityMultiplier));
        
        // Add news event effects on cargo prices
        const activeNews = gs.system.news.filter(news => 
            news.started && !news.ended && (news.planet === this.planet || news.targetPlanet === this.planet)
        );
        
        for (const news of activeNews) {
            // Check start effects
            if (news.startEffects) {
                for (const effect of news.startEffects) {
                    const modifier = effect.cargoPriceMultipliers.getAmount(ct);
                    if (modifier && modifier !== 1.0) {
                        calc.addFactor(news.newsType.name.toLowerCase(), modifier);
                    }
                }
            }
        }
        
        // Cargo-specific demand factors
        if (ct === CARGO_TYPES.FOOD) {
            calc.addFactor('population demand', 0.8 + civ.population * 1.2);
            calc.addFactor('low reserves', 1.0 + (1.0 / Math.max(0.5, civ.reserves)) * 0.5);
        }
        else if (ct === CARGO_TYPES.METAL) {
            calc.addFactor('industrial demand', 0.5 + civ.industry * 1.5);
        }
        else if (ct === CARGO_TYPES.WATER) {
            calc.addFactor('population demand', 0.5 + civ.population * 1.0);
            calc.addFactor('low reserves', 1.0 / Math.max(0.5, civ.reserves));
        }
        else if (ct === CARGO_TYPES.ISOTOPES) {
            calc.addFactor('tech demand', 0.5 + civ.technology * 1.5);
            calc.addFactor('education demand', 0.5 + civ.education * 0.5);
        }
        else if (ct === CARGO_TYPES.NANITES) {
            calc.addFactor('economic demand', 0.5 + civ.economy * 1.0);
            calc.addFactor('expansion demand', 0.5 + civ.territory * 0.5);
        }
        else if (ct === CARGO_TYPES.MEDICINE) {
            calc.addFactor('population need', 0.5 + civ.population * 0.8);
            calc.addFactor('wealth demand', 0.5 + civ.wealth * 0.5);
            calc.addFactor('insecurity', 1.0 + (1.0 / Math.max(0.5, civ.security)) * 0.5);
        }
        else if (ct === CARGO_TYPES.HOLOCUBES) {
            calc.addFactor('cultural demand', 0.3 + civ.culture * 1.5);
            calc.addFactor('wealth demand', 0.7 + civ.wealth * 0.8);
        }
        else if (ct === CARGO_TYPES.WEAPONS) {
            calc.addFactor('military demand', 0.5 + civ.army * 1.2);
            calc.addFactor('naval demand', 0.5 + civ.navy * 0.8);
            calc.addFactor('criminal demand', 0.5 + civ.crime * 1.0);
            calc.addFactor('low security', 1.0 / Math.max(0.5, civ.security));
        }
        else if (ct === CARGO_TYPES.DRUGS) {
            calc.addFactor('criminal demand', 0.5 + civ.crime * 2.0);
            calc.addFactor('corruption', 0.5 + civ.corruption * 1.0);
            calc.addFactor('wealth', 0.5 + civ.wealth * 0.5);
            calc.addFactor('low education', 1.0 / Math.max(0.5, civ.education));
        }
        else if (ct === CARGO_TYPES.ANTIMATTER) {
            calc.addFactor('naval demand', 0.5 + civ.navy * 1.5);
            calc.addFactor('tech demand', 0.5 + civ.technology * 1.0);
            calc.addFactor('military demand', 0.5 + civ.army * 0.5);
        }
        
        return calc;
    }

    //sticking with having corruption raise prices even at the black market
    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const priceCalc = this.calcCargoPriceModifier(cargoType);
            
            // Add market-specific factors
            priceCalc.addFactor('merchant greed', 1 + this.planet.c.corruption);
            priceCalc.addFactor('inflation', 1 + this.planet.c.inflationRate);
            
            if (this.blackMarket) {
                priceCalc.addFactor('black market risk', 1 / this.planet.c.crime);
            } else {
                priceCalc.addFactor('reserves', 1 / this.planet.c.reserves);
                priceCalc.addFactor('taxes', 1 + this.planet.c.taxRate);
            }
            
            const price = Math.round(priceCalc.calculate(cargoType.value));
            prices.setAmount(cargoType, price);
        }
        return prices;
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const priceCalc = this.calcCargoPriceModifier(cargoType);
            
            // Add market-specific factors (sell prices are lower than buy)
            priceCalc.addFactor('merchant greed', 1 / (1 + this.planet.c.corruption));
            priceCalc.addFactor('inflation', 1 + this.planet.c.inflationRate);
            
            if (this.blackMarket) {
                priceCalc.addFactor('black market risk', 1 / this.planet.c.crime);
            } else {
                priceCalc.addFactor('reserves', 1 / this.planet.c.reserves);
                priceCalc.addFactor('taxes', 1 - this.planet.c.taxRate);
            }
            
            const price = Math.round(priceCalc.calculate(cargoType.value));
            prices.setAmount(cargoType, price);
        }
        return prices;
    }

    /**
     * Get the full price calculation breakdown for a specific cargo type (buy).
     * @param {CargoType} cargoType - The cargo type to calculate for.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getCargoBuyPriceCalculation(cargoType = CARGO_TYPES_ALL[0]) {
        const priceCalc = this.calcCargoPriceModifier(cargoType);
        
        // Add market-specific factors
        priceCalc.addFactor('merchant greed', 1 + this.planet.c.corruption);
        priceCalc.addFactor('inflation', this.planet.c.inflationRate);
        
        if (this.blackMarket) {
            priceCalc.addFactor('black market risk', 1 / this.planet.c.crime);
        } else {
            priceCalc.addFactor('reserves', 1 / this.planet.c.reserves);
            priceCalc.addFactor('taxes', 1 + this.planet.c.taxRate);
        }
        
        return priceCalc;
    }

    /**
     * Get the full price calculation breakdown for a specific cargo type (sell).
     * @param {CargoType} cargoType - The cargo type to calculate for.
     * @returns {Calculation} The calculation showing all price factors.
     */
    getCargoSellPriceCalculation(cargoType = CARGO_TYPES_ALL[0]) {
        const priceCalc = this.calcCargoPriceModifier(cargoType);
        
        // Add market-specific factors (sell prices are lower than buy)
        priceCalc.addFactor('merchant greed', 1 / (1 + this.planet.c.corruption));
        priceCalc.addFactor('inflation', this.planet.c.inflationRate);
        
        if (this.blackMarket) {
            priceCalc.addFactor('black market risk', 1 / this.planet.c.crime);
        } else {
            priceCalc.addFactor('reserves', 1 / this.planet.c.reserves);
            priceCalc.addFactor('taxes', 1 - this.planet.c.taxRate);
        }
        
        return priceCalc;
    }
}
