/**
 * A building where you can hire officers
 * @class Tavern
 * @extends {Building}
 */
class Tavern extends Building {
    /**
     * @param {Planet} planet - The planet this tavern is on.
     * @param {boolean} isTavern - Whether this is a tavern (true) or academy (false).
     */
    constructor(planet = new Planet(), isTavern = false) {
        super(planet, BUILDING_TYPES.TAVERN)
        /** @type {boolean} */
        this.isTavern = isTavern;
        /** @type {Officer[]} */
        this.officers = [];
        this.normalize(true)
    }
    calcHirePrice(officer) {
        const basePrice = Math.round(officer.value * (1+this.planet.c.corruption) * this.planet.c.inflationRate / (this.isTavern ? this.planet.c.crime : this.planet.c.army))
        // Taverns don't charge taxes (similar to black market)
        if (this.isTavern) {
            return basePrice
        }
        return Math.round(basePrice * (1 + this.planet.c.taxRate))
    }
    get baseNumOfficers() {
        return GUILD_AVERAGE_NUM_OFFICERS * (this.isTavern ? this.planet.c.crime : this.planet.c.army) * this.planet.c.population * this.level
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.officers = []
        }
        const officerDiffFromBase = this.officers.length - this.baseNumOfficers
        if (officerDiffFromBase > 0) {
            this.officers.splice(0, officerDiffFromBase)
        } else if (officerDiffFromBase < 0) {
            // Filter for player-available factions only, and filter by criminal status (tavern = criminals, academy = non-criminals)
            // Neither stocks religious people
            const validFactionTypes = PLAYER_FACTIONS.filter(f => 
                !f.religious && (this.isTavern ? f.criminal : !f.criminal)
            )
            
            for (let i = 0; i < -officerDiffFromBase; i++) {
                const factionType = rndMember(validFactionTypes)
                this.officers.push(generateOfficer(this.planet, factionType))
            }
        }
    }
    
    /**
     * Gets gossip about skill training prices at different planets
     * @returns {string|null}
     */
    getSkillsGossip() {
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets]
        const bodiesWithAcademies = allBodies.filter(p => p.settlement.academy && p.settlement.academy.level > 0)
        if (bodiesWithAcademies.length === 0) return null
        
        const randomBody = rndMember(bodiesWithAcademies)
        const skill = rndMember(SKILLS_ALL)
        const priceMultiplier = randomBody.c.skillPriceMultipliers.getAmount(skill) || 1
        
        if (priceMultiplier < 0.8) {
            return `If you're looking to train ${skill.name}, ${randomBody.name} has the best prices.`
        } else if (priceMultiplier > 1.2) {
            return `Training ${skill.name} at ${randomBody.name} is really expensive right now.`
        }
        return null
    }
    
    /**
     * Gets gossip about good buy prices (low prices to buy cargo)
     * @returns {string|null}
     */
    getBuyPriceGossip() {
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets]
        const bodiesWithMarkets = allBodies.filter(p => p.settlement.market && p.settlement.market.level > 0)
        if (bodiesWithMarkets.length === 0) return null
        
        const randomBody = rndMember(bodiesWithMarkets)
        const cargoType = rndMember(CARGO_TYPES_ALL)
        const buyPrice = randomBody.settlement.market.calcCargoBuyPrices().getAmount(cargoType)
        const avgPrice = cargoType.value
        
        if (buyPrice < avgPrice * 0.7) {
            return `I heard ${randomBody.name} is having a sale on ${coloredName(cargoType)}.`
        }
        return null
    }
    
    /**
     * Gets gossip about good sell prices (high prices to sell cargo)
     * @returns {string|null}
     */
    getSellPriceGossip() {
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets]
        const bodiesWithMarkets = allBodies.filter(p => p.settlement.market && p.settlement.market.level > 0)
        if (bodiesWithMarkets.length === 0) return null
        
        const randomBody = rndMember(bodiesWithMarkets)
        const cargoType = rndMember(CARGO_TYPES_ALL)
        const sellPrice = randomBody.settlement.market.calcCargoSellPrices().getAmount(cargoType)
        const avgPrice = cargoType.value
        
        if (sellPrice > avgPrice * 1.3) {
            return `${randomBody.name} is paying top dollar for ${coloredName(cargoType)} right now.`
        }
        return null
    }
    
    /**
     * Gets gossip about anomalies in the system
     * @returns {string|null}
     */
    getAnomalyGossip() {
        if (!gs.system.anomalies || gs.system.anomalies.length === 0) return null
        
        const undiscoveredAnomalies = gs.system.anomalies.filter(a => a.discoveredYear === null)
        if (undiscoveredAnomalies.length === 0) return null
        
        const anomaly = rndMember(undiscoveredAnomalies)
        const roughX = Math.round(anomaly.x / 5) * 5
        const roughY = Math.round(anomaly.y / 5) * 5
        
        return `I heard there was an anomaly near ${roughX}, ${roughY}.`
    }
    
    /**
     * Gets gossip about good officers at other academies
     * @returns {string|null}
     */
    getOfficerGossip() {
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets]
        const bodiesWithAcademies = allBodies.filter(p => p.settlement.academy && p.settlement.guild.officers.length > 0)
        if (bodiesWithAcademies.length === 0) return null
        
        const randomBody = rndMember(bodiesWithAcademies)
        const officers = randomBody.settlement.guild.officers
        const goodOfficers = officers.filter(o => o.level >= 3 || o.implants.length > 0)
        
        if (goodOfficers.length > 0) {
            const officer = rndMember(goodOfficers)
            return `I heard there's a really good officer at the Guild on ${randomBody.name}. Name of ${officer.name}.`
        }
        return null
    }
    
    /**
     * Gets gossip about destroyed buildings
     * @returns {string|null}
     */
    getBuildingGossip() {
        const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets]
        const destroyedBuildings = []
        
        for (const body of allBodies) {
            if (body.settlement.shipyard && body.settlement.shipyard.level === 0) {
                destroyedBuildings.push({body, building: 'shipyard'})
            }
            if (body.settlement.market && body.settlement.market.level === 0) {
                destroyedBuildings.push({body, building: 'market'})
            }
        }
        
        if (destroyedBuildings.length === 0) return null
        
        const {body, building} = rndMember(destroyedBuildings)
        return `${body.name}'s ${building} was destroyed recently. No telling when it will be back up.`
    }
    
    /**
     * Gets gossip about fleet activity
     * @returns {string|null}
     */
    getFleetGossip() {
        if (!gs.system.abandonedFleets || gs.system.abandonedFleets.length === 0) return null
        
        const recentlyAbandoned = gs.system.abandonedFleets.filter(af => 
            gs.year - (af.abandonedYear || 0) < 2
        )
        
        if (recentlyAbandoned.length === 0) return null
        
        const fleet = rndMember(recentlyAbandoned)
        const [nearestPlanet] = gs.system.calcNearestPlanet(fleet)
        
        return `I heard a ${fleet.factionType.name} ${fleet.fleetType.name.toLowerCase()} was destroyed by ${fleet.destroyedBy || 'unknown forces'} near ${nearestPlanet.name}.`
    }
    
    /**
     * Generates a set of gossip lines with accurate game information
     * @returns {string}
     */
    gossip() {
        const gossipFunctions = [
            () => this.getSkillsGossip(),
            () => this.getBuyPriceGossip(),
            () => this.getSellPriceGossip(),
            () => this.getAnomalyGossip(),
            () => this.getOfficerGossip(),
            () => this.getBuildingGossip(),
            () => this.getFleetGossip(),
        ]
        
        const gossipLines = []
        const attempts = 20 // Try up to 20 times to get 5 unique gossip lines
        let attemptsCount = 0
        
        while (gossipLines.length < 5 && attemptsCount < attempts) {
            const gossipFn = rndMember(gossipFunctions)
            const line = gossipFn()
            if (line && !gossipLines.includes(line)) {
                gossipLines.push(line)
            }
            attemptsCount++
        }
        
        // If we didn't get enough gossip, add some generic lines
        if (gossipLines.length < 3) {
            gossipLines.push('Things have been quiet around here lately.')
        }
        
        return gossipLines.join('<br/>')
    }
}
