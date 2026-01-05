/**
 * A building where cargo can be bought and sold.
 * @class Market
 * @extends {Building}
 */
class Market extends Building {
    /**
     * @param {Planet} planet - The planet this market is on.
     * @param {boolean} blackMarket - Whether this is a black market (illegal goods).
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), blackMarket = false, moon = null) {
        super(planet, BUILDING_TYPES.MARKET, moon)
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
        const climate = this.planet.climate
        
        // Base availability
        calc.addFactor('base', 1.0);
        
        // Each cargo type has different production/availability based on civilization attributes
        if (ct == CARGO_TYPES.FOOD) {
            // Food production based on territory, population, and favorable climate
            calc.addFactor('territory', 0.5 + civ.territory * 0.8);
            calc.addFactor('economy', 0.5 + civ.economy * 0.5);
            
            // Ocean type affects food production
            if (climate.oceanType === PLANET_OCEAN_TYPES.WATER) {
                calc.addFactor('water oceans', 1.8);  // Water oceans enable fishing and agriculture
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.BRINE) {
                calc.addFactor('brine oceans', 1.3);  // Brine can support some aquaculture
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.SUBSURFACE_WATER) {
                calc.addFactor('subsurface water', 1.2);  // Subsurface water can be used for hydroponics
            }
            
            // Atmosphere type affects food production
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.OXYGEN_NITROGEN) {
                calc.addFactor('breathable atmosphere', 1.5);  // Breathable atmosphere ideal for farming
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.CARBONACEOUS_DIOXIDE) {
                calc.addFactor('CO2 atmosphere', 0.8);  // CO2 atmosphere requires greenhouses
            }
            
            // Geology affects soil quality
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.SILICATE_IRON || 
                climate.geologyType === PLANET_GEOLOGY_TYPES.GRANITE) {
                calc.addFactor('good soil', 1.3);  // Good soil composition
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.BASALTIC) {
                calc.addFactor('volcanic soil', 1.4);  // Volcanic soil is very fertile
            }
        }
        else if (ct == CARGO_TYPES.METAL) {
            // Industrial planets produce more metal
            calc.addFactor('industry', 0.5 + civ.industry * 1.8);
            calc.addFactor('economy', 0.5 + civ.economy * 0.5);
            
            // Geology type affects metal availability
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.METALLIC) {
                calc.addFactor('metallic core', 2.0);  // Metallic composition = abundant metal
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.SILICATE_IRON) {
                calc.addFactor('iron-rich geology', 1.5);  // Iron-rich geology
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.CARBONACEOUS) {
                calc.addFactor('carbon-rich geology', 0.7);  // Carbon-rich = less metal
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE || 
                       climate.geologyType === PLANET_GEOLOGY_TYPES.METHANE_ICE ||
                       climate.geologyType === PLANET_GEOLOGY_TYPES.NITROGEN_ICE) {
                calc.addFactor('ice geology', 0.3);  // Ice planets = very little metal
            }
        }
        else if (ct == CARGO_TYPES.WATER) {
            // Water availability based on reserves and infrastructure
            calc.addFactor('reserves', 0.5 + civ.reserves * 1.5);
            calc.addFactor('territory', 0.5 + civ.territory * 0.3);
            
            // Ocean and geology types dramatically affect water availability
            if (climate.oceanType === PLANET_OCEAN_TYPES.WATER) {
                calc.addFactor('water oceans', 2.5);  // Abundant liquid water
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.SUBSURFACE_WATER) {
                calc.addFactor('subsurface water', 1.8);  // Hidden water requires extraction
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.BRINE) {
                calc.addFactor('brine oceans', 1.2);  // Salty water can be desalinated
            }
            
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE) {
                calc.addFactor('ice geology', 2.0);  // Ice can be melted for water
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.MIXED_ICE) {
                calc.addFactor('mixed ice', 1.5);  // Some water ice available
            }
        }
        else if (ct == CARGO_TYPES.ISOTOPES) {
            // Scientific production - high tech civilizations produce isotopes
            calc.addFactor('technology', 0.3 + civ.technology * 1.5);
            calc.addFactor('industry', 0.7 + civ.industry * 0.8);
            
            // Gas giant atmospheres contain useful isotopes
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.HYDROGEN_HELIUM) {
                calc.addFactor('gas giant atmosphere', 2.0);  // Gas giants rich in isotopes
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.METHANE) {
                calc.addFactor('methane atmosphere', 1.3);  // Methane atmospheres have some isotopes
            }
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
        const climate = this.planet.climate
        
        // Availability affects price (inverse relationship - low availability = high price)
        const availabilityCalc = this.calcCargoAvailabilityModifier(ct);
        const availabilityMultiplier = availabilityCalc.getTotalMultiplier();
        // Invert availability: low availability (0.5x) = high price (2x)
        calc.addFactor('availability', 1.0 / Math.max(0.1, availabilityMultiplier));
        
        // Climate-based price adjustments
        const planetType = this.planet.planetType;
        
        if (ct === CARGO_TYPES.FOOD) {
            // Food demand based on population
            calc.addFactor('population demand', 0.8 + civ.population * 1.2);
            
            // Climate effects on food prices
            if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
                calc.addFactor('gas giant premium', 3.0);
            } else if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
                calc.addFactor('ice giant premium', 2.5);
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.OXYGEN_NITROGEN) {
                calc.addFactor('breathable air discount', 0.7);
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFURIC_ACID ||
                       climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFUR_DIOXIDE) {
                calc.addFactor('toxic atmosphere premium', 2.0);
            }
            
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.NONE ||
                climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFURIC_ACID ||
                climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFUR_DIOXIDE) {
                calc.addFactor('import dependency', 1.8);
            }
            
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.METALLIC ||
                climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE ||
                climate.geologyType === PLANET_GEOLOGY_TYPES.NITROGEN_ICE) {
                calc.addFactor('poor soil', 1.5);
            }
            
            // Low reserves means scarcity
            calc.addFactor('low reserves', 1.0 + (1.0 / Math.max(0.5, civ.reserves)) * 0.5);
        }
        else if (ct === CARGO_TYPES.METAL) {
            calc.addFactor('industrial demand', 0.5 + civ.industry * 1.5);
            
            if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
                calc.addFactor('gas giant scarcity', 1.5);
            } else if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
                calc.addFactor('ice giant scarcity', 1.4);
            } else if (planetType === PLANET_TYPES.TERRESTRIAL || planetType === PLANET_TYPES.EARTHLIKE) {
                calc.addFactor('terrestrial abundance', 0.6);
            }
        }
        else if (ct === CARGO_TYPES.WATER) {
            calc.addFactor('population demand', 0.5 + civ.population * 1.0);
            calc.addFactor('low reserves', 1.0 / Math.max(0.5, civ.reserves));
            
            if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
                calc.addFactor('ice abundance', 0.5);
            } else if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
                calc.addFactor('gas giant scarcity', 1.3);
            }
        }
        else if (ct === CARGO_TYPES.ISOTOPES) {
            calc.addFactor('tech demand', 0.5 + civ.technology * 1.5);
            calc.addFactor('education demand', 0.5 + civ.education * 0.5);
            
            if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
                calc.addFactor('gas giant abundance', 0.5);
            } else if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
                calc.addFactor('ice giant premium', 1.2);
            } else if (planetType === PLANET_TYPES.TERRESTRIAL || planetType === PLANET_TYPES.EARTHLIKE) {
                calc.addFactor('terrestrial scarcity', 1.3);
            }
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
