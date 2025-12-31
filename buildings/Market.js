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
        for (const cargoType of CARGO_TYPES_ALL) {
            //simple supply and demand - as price goes up, availability goes down
            const baseAmount = Math.round(MARKET_AVERAGE_CARGO_PER_TYPE/this.planet.c.cargoPriceMultipliers.getAmount(cargoType))
            const availabilityModifier = this.calcCargoAvailabilityModifier(cargoType)
            const amount = this.blackMarket 
                ? baseAmount * this.planet.c.crime * availabilityModifier
                : baseAmount * this.planet.c.reserves * availabilityModifier
            baseCargo.setAmount(cargoType, amount)
        }
        return baseCargo
    }

    calcCargoAvailabilityModifier(ct = CARGO_TYPES_ALL[0]) {
        const civ = this.planet.civilization
        const climate = this.planet.climate
        
        // Each cargo type has different production/availability based on civilization attributes
        if (ct == CARGO_TYPES.FOOD) {
            // Food production based on territory, population, and favorable climate
            // Earthlike planets with water oceans produce more food
            let foodModifier = 0.5 + (civ.territory * 0.8) + (civ.economy * 0.5)
            
            // Ocean type affects food production
            if (climate.oceanType === PLANET_OCEAN_TYPES.WATER) {
                foodModifier *= 1.8  // Water oceans enable fishing and agriculture
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.BRINE) {
                foodModifier *= 1.3  // Brine can support some aquaculture
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.SUBSURFACE_WATER) {
                foodModifier *= 1.2  // Subsurface water can be used for hydroponics
            }
            
            // Atmosphere type affects food production
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.OXYGEN_NITROGEN) {
                foodModifier *= 1.5  // Breathable atmosphere ideal for farming
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.CARBONACEOUS_DIOXIDE) {
                foodModifier *= 0.8  // CO2 atmosphere requires greenhouses
            }
            
            // Geology affects soil quality
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.SILICATE_IRON || 
                climate.geologyType === PLANET_GEOLOGY_TYPES.GRANITE) {
                foodModifier *= 1.3  // Good soil composition
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.BASALTIC) {
                foodModifier *= 1.4  // Volcanic soil is very fertile
            }
            
            return foodModifier
        }
        
        if (ct == CARGO_TYPES.METAL) {
            // Industrial planets produce more metal
            // Higher industry and economy = more metal production
            let metalModifier = 0.5 + (civ.industry * 1.8) + (civ.economy * 0.5)
            
            // Geology type affects metal availability
            const climate = this.planet.climate
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.METALLIC) {
                metalModifier *= 2.0  // Metallic composition = abundant metal
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.SILICATE_IRON) {
                metalModifier *= 1.5  // Iron-rich geology
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.CARBONACEOUS) {
                metalModifier *= 0.7  // Carbon-rich = less metal
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE || 
                       climate.geologyType === PLANET_GEOLOGY_TYPES.METHANE_ICE ||
                       climate.geologyType === PLANET_GEOLOGY_TYPES.NITROGEN_ICE) {
                metalModifier *= 0.3  // Ice planets = very little metal
            }
            
            return metalModifier
        }
        
        if (ct == CARGO_TYPES.WATER) {
            // Water availability based on reserves and infrastructure
            // Higher reserves and territory = more water sources
            let waterModifier = 0.5 + (civ.reserves * 1.5) + (civ.territory * 0.3)
            
            // Ocean and geology types dramatically affect water availability
            const climate = this.planet.climate
            if (climate.oceanType === PLANET_OCEAN_TYPES.WATER) {
                waterModifier *= 2.5  // Abundant liquid water
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.SUBSURFACE_WATER) {
                waterModifier *= 1.8  // Hidden water requires extraction
            } else if (climate.oceanType === PLANET_OCEAN_TYPES.BRINE) {
                waterModifier *= 1.2  // Salty water can be desalinated
            }
            
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE) {
                waterModifier *= 2.0  // Ice can be melted for water
            } else if (climate.geologyType === PLANET_GEOLOGY_TYPES.MIXED_ICE) {
                waterModifier *= 1.5  // Some water ice available
            }
            
            return waterModifier
        }
        
        if (ct == CARGO_TYPES.ISOTOPES) {
            // Scientific production - high tech civilizations produce isotopes
            // Technology and industry enable isotope production
            let isotopeModifier = 0.3 + (civ.technology * 1.5) + (civ.industry * 0.8)
            
            // Gas giant atmospheres contain useful isotopes
            const climate = this.planet.climate
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.HYDROGEN_HELIUM) {
                isotopeModifier *= 2.0  // Gas giants rich in isotopes
            } else if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.METHANE) {
                isotopeModifier *= 1.3  // Methane atmospheres have some isotopes
            }
            
            return isotopeModifier
        }
        
        if (ct == CARGO_TYPES.NANITES) {
            // Advanced manufacturing product
            // Technology and industry drive nanite production
            return 0.3 + (civ.technology * 1.2) + (civ.industry * 1.0) + (civ.economy * 0.5)
        }
        
        if (ct == CARGO_TYPES.MEDICINE) {
            // Medical production - education, wealth, and technology
            // Advanced, wealthy civilizations produce more medicine
            return 0.4 + (civ.education * 1.2) + (civ.wealth * 0.8) + (civ.technology * 0.5)
        }
        
        if (ct == CARGO_TYPES.HOLOCUBES) {
            // Entertainment production - culture and economy
            // Cultural centers and wealthy economies produce entertainment
            return 0.3 + (civ.culture * 1.8) + (civ.economy * 0.7) + (civ.wealth * 0.5)
        }
        
        if (ct == CARGO_TYPES.WEAPONS) {
            // Illegal - black market availability
            // Crime, military production, low security = more weapons available
            return 0.3 + (civ.crime * 2.0) + (civ.army * 1.2) + (civ.corruption * 1.0) + (1.0 / Math.max(0.5, civ.security))
        }
        
        if (ct == CARGO_TYPES.DRUGS) {
            // Illegal - crime and corruption enable drug production/trade
            // High crime, corruption, low security = more drugs
            return 0.2 + (civ.crime * 2.5) + (civ.corruption * 1.5) + (1.0 / Math.max(0.5, civ.security)) + (1.0 / Math.max(0.5, civ.education))
        }
        
        if (ct == CARGO_TYPES.ANTIMATTER) {
            // Highly restricted - only high tech military civilizations
            // Navy, technology, and wealth enable antimatter production
            return 0.2 + (civ.navy * 1.5) + (civ.technology * 1.5) + (civ.wealth * 0.5)
        }
        
        return 1.0
    }

    calcClimateBasedPriceModifier(ct = CARGO_TYPES_ALL[0]) {
        const planetType = this.planet.planetType
        const climate = this.planet.climate
        
        // Climate-based price adjustments based on planet type
        
        // Food is expensive on inhospitable worlds
        if (ct === CARGO_TYPES.FOOD) {
            if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
                return 3.0  // 200% more expensive - no surface for farming
            }
            if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
                return 2.5  // 150% more expensive - frozen wasteland
            }
            // Breathable atmosphere makes food cheaper
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.OXYGEN_NITROGEN) {
                return 0.7  // 30% cheaper with breathable air
            }
            // Toxic atmospheres make food expensive
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFURIC_ACID ||
                climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFUR_DIOXIDE) {
                return 2.0  // 100% more expensive
            }
        }
        
        // Gas giants have abundant isotopes
        if (planetType === PLANET_TYPES.GAS_GIANT || planetType === PLANET_TYPES.GAS_DWARF) {
            if (ct === CARGO_TYPES.ISOTOPES) return 0.5  // 50% cheaper isotopes
            if (ct === CARGO_TYPES.METAL) return 1.5     // 50% more expensive metals (scarce)
            if (ct === CARGO_TYPES.WATER) return 1.3     // 30% more expensive water (scarce)
        }
        
        // Ice giants have abundant water
        if (planetType === PLANET_TYPES.ICE_GIANT || planetType === PLANET_TYPES.ICE_DWARF) {
            if (ct === CARGO_TYPES.WATER) return 0.5     // 50% cheaper water
            if (ct === CARGO_TYPES.METAL) return 1.4     // 40% more expensive metals (scarce)
            if (ct === CARGO_TYPES.ISOTOPES) return 1.2  // 20% more expensive isotopes
        }
        
        // Terrestrial/Earthlike planets have abundant metals
        if (planetType === PLANET_TYPES.TERRESTRIAL || planetType === PLANET_TYPES.EARTHLIKE) {
            if (ct === CARGO_TYPES.METAL) return 0.6     // 40% cheaper metals
            if (ct === CARGO_TYPES.ISOTOPES) return 1.3  // 30% more expensive isotopes
        }
        
        return 1.0  // No climate adjustment
    }

    calcCargoPriceModifier(ct = CARGO_TYPES_ALL[0]) {
        const civ = this.planet.civilization
        
        // Each cargo type has different demand based on civilization attributes
        if (ct == CARGO_TYPES.FOOD) {
            // Food demand based on population and inability to produce locally
            // Higher population = higher demand
            let foodDemand = 0.8 + (civ.population * 1.2)
            
            const climate = this.planet.climate
            // Harsh environments increase food demand (can't produce locally)
            if (climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.NONE ||
                climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFURIC_ACID ||
                climate.atmosphereType === PLANET_ATMOSPHERE_TYPES.SULFUR_DIOXIDE) {
                foodDemand *= 1.8  // Must import all food
            }
            
            if (climate.geologyType === PLANET_GEOLOGY_TYPES.METALLIC ||
                climate.geologyType === PLANET_GEOLOGY_TYPES.WATER_ICE ||
                climate.geologyType === PLANET_GEOLOGY_TYPES.NITROGEN_ICE) {
                foodDemand *= 1.5  // Poor soil = higher food prices
            }
            
            // Lower reserves means food scarcity
            foodDemand += (1.0 / Math.max(0.5, civ.reserves)) * 0.5
            
            return foodDemand
        }
        
        if (ct == CARGO_TYPES.METAL) {
            // Industrial planets need more metal for manufacturing
            // Higher industry = higher demand = higher prices
            return 0.5 + (civ.industry * 1.5)
        }
        
        if (ct == CARGO_TYPES.WATER) {
            // Essential for life - higher population = higher demand
            // Low reserves also increases demand
            return 0.5 + (civ.population * 1.0) + (1.0 / Math.max(0.5, civ.reserves))
        }
        
        if (ct == CARGO_TYPES.ISOTOPES) {
            // Used for research and technology
            // High tech civilizations need more isotopes
            return 0.5 + (civ.technology * 1.5) + (civ.education * 0.5)
        }
        
        if (ct == CARGO_TYPES.NANITES) {
            // Used for construction and infrastructure
            // Growing economies and territories need more nanites
            return 0.5 + (civ.economy * 1.0) + (civ.territory * 0.5)
        }
        
        if (ct == CARGO_TYPES.MEDICINE) {
            // Healthcare demand - population, wealth, and education affect it
            // Lower security can mean more injuries/illness
            return 0.5 + (civ.population * 0.8) + (civ.wealth * 0.5) + (1.0 / Math.max(0.5, civ.security))
        }
        
        if (ct == CARGO_TYPES.HOLOCUBES) {
            // Entertainment - culture and wealth drive demand
            // Higher culture = more entertainment consumption
            return 0.3 + (civ.culture * 1.5) + (civ.wealth * 0.8)
        }
        
        if (ct == CARGO_TYPES.WEAPONS) {
            // Illegal - high military, low security, or conflict increases demand
            // Army and navy need weapons, crime creates black market demand
            return 0.5 + (civ.army * 1.2) + (civ.navy * 0.8) + (civ.crime * 1.0) + (1.0 / Math.max(0.5, civ.security))
        }
        
        if (ct == CARGO_TYPES.DRUGS) {
            // Illegal - crime, low education, and corruption drive demand
            // Wealthier planets can afford more expensive drugs
            return 0.5 + (civ.crime * 2.0) + (civ.corruption * 1.0) + (civ.wealth * 0.5) + (1.0 / Math.max(0.5, civ.education))
        }
        
        if (ct == CARGO_TYPES.ANTIMATTER) {
            // Military fuel and weapons - navy and technology drive demand
            // High tech militaries need antimatter for advanced ships/weapons
            return 0.5 + (civ.navy * 1.5) + (civ.technology * 1.0) + (civ.army * 0.5)
        }
        
        return 1.0
    }

    //sticking with having corruption raise prices even at the black market
    calcCargoBuyPrices() {
        const prices = new CountsMap()
        for (const cargoType of CARGO_TYPES_ALL) {
            const climateModifier = this.calcClimateBasedPriceModifier(cargoType)
            const basePrice = cargoType.value * this.planet.c.cargoPriceMultipliers.getAmount(cargoType) * this.calcCargoPriceModifier(cargoType) * climateModifier
            let price = 
                this.blackMarket ? Math.round(basePrice * (1+this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.crime)
                : Math.round(basePrice * (1+this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.reserves)
            // Apply taxes only to regular market
            if (!this.blackMarket) {
                price = Math.round(price * (1 + this.planet.c.taxRate))
            }
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new CountsMap()
            for (const cargoType of CARGO_TYPES_ALL) {
            const climateModifier = this.calcClimateBasedPriceModifier(cargoType)
            const basePrice = cargoType.value * this.planet.c.cargoPriceMultipliers.getAmount(cargoType) * climateModifier
            let price = 
                this.blackMarket ? Math.round(basePrice / (1+this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.crime)
                : Math.round(basePrice / (1+this.planet.c.corruption) * this.planet.c.inflation / this.planet.c.reserves)
            // Apply taxes only to regular market
            if (!this.blackMarket) {
                price = Math.round(price * (1 - this.planet.c.taxRate))
            }
            prices.setAmount(cargoType, price)
        }
        return prices
    }
}
