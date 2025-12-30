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
        
        // Each cargo type has different production/availability based on civilization attributes
        if (ct == CARGO_TYPES.METAL) {
            // Industrial planets produce more metal
            // Higher industry and economy = more metal production
            return 0.5 + (civ.industry * 1.8) + (civ.economy * 0.5)
        }
        
        if (ct == CARGO_TYPES.WATER) {
            // Water availability based on reserves and infrastructure
            // Higher reserves and territory = more water sources
            return 0.5 + (civ.reserves * 1.5) + (civ.territory * 0.3)
        }
        
        if (ct == CARGO_TYPES.ISOTOPES) {
            // Scientific production - high tech civilizations produce isotopes
            // Technology and industry enable isotope production
            return 0.3 + (civ.technology * 1.5) + (civ.industry * 0.8)
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
        
        // Climate-based price adjustments based on planet type
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
