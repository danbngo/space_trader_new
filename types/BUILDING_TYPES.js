/**
 * Represents a type of building that can exist on a planet.
 * @class BuildingType
 */
class BuildingType {
    /**
     * @param {string} name - The name of the building type.
     * @param {number[]} color - The color associated with this building type.
     */
    constructor(name = '', color = COLORS.White, baseCredits = 1, minFame = FAME_LEVELS.UNKNOWN, minInfamy = INFAMY_LEVELS.UNKNOWN, minFameOrInfamy = FAME_LEVELS.UNKNOWN, minBounty = 0) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {FameLevel} */
        this.minFame = minFame
        /** @type {FameLevel} */
        this.minInfamy = minInfamy
        /** @type {FameLevel} */
        this.minFameOrInfamy = minFameOrInfamy
        /** @type {number} */
        this.minBounty = minBounty
        /** @type {number} */
        this.baseCredits = baseCredits
    }
    
    /**
     * Check if player meets reputation requirements for this building
     * @param {Planet} planet - The planet to check reputation for
     * @returns {boolean} True if player meets at least one requirement
     */
    meetsReputationRequirement(planet) {
        // Player must meet at least ONE of the requirements
        const result = FameLevel.hasFameLevel(gs.captain, planet, this.minFame) && FameLevel.hasInfamyLevel(gs.captain, planet, this.minInfamy) &&
            FameLevel.hasFameOrInfamyLevel(gs.captain, planet, this.minFameOrInfamy) && (gs.captain.bounty.getAmount(planet) >= this.minBounty)

        console.log('checking captain meets requirement for building:',{planet,result,building:this})
        return result

        }
    
    /**
     * Check if player can access this building (reputation + special conditions)
     * @param {Planet} planet - The planet to check access for
     * @param {boolean} isDocked - Whether the player is docked at the planet
     * @returns {Object} {canShow: boolean, isDisabled: boolean}
     */
    canAccess(planet, isDocked) {
        // First check reputation requirement
        if (!this.meetsReputationRequirement(planet)) {
            return {canShow: false, isDisabled: false}
        }
        
        // Check government blocks
        const blockedBuildings = planet.civilization.governmentType.blockedBuildings || []
        const isBlocked = blockedBuildings.includes(this)
        
        // Palace has special access requirements
        if (this === BUILDING_TYPES.PALACE) {
            const hasBounty = gs.captain.calcBountyForPlanet(planet) > 0
            const hasInfamy = gs.captain.calcReputationForTarget(planet) < 0
            const playerRank = gs.captain.ranks.get(planet) || RANK_TYPES.NO_RANK
            const isElite = playerRank === RANK_TYPES.ELITE
            const canEnter = !hasBounty && (!hasInfamy || isElite) && !isBlocked
            return {canShow: true, isDisabled: !isDocked || !canEnter}
        }
        
        return {canShow: true, isDisabled: isBlocked}
    }
}

const BUILDING_TYPES = {
    SHIPYARD: new BuildingType('Shipyard', COLORS.LightGray, 20*1000),
    MARKET: new BuildingType('Market', COLORS.LightBlue, 30*1000),
    BANK: new BuildingType('Bank', COLORS.Yellow, 50*1000, FAME_LEVELS.LIKED),
    BLACK_MARKET: new BuildingType('Black Market', COLORS.Red, 10*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.DISLIKED),
    GUILD: new BuildingType('Guild', COLORS.Purple, 10*1000, FAME_LEVELS.RENOWNED),
    ACADEMY: new BuildingType('Academy', COLORS.Green, 10*1000, FAME_LEVELS.REPUTABLE),
    TAVERN: new BuildingType('Tavern', COLORS.Orange, 5*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.DISREPUTABLE),
    COURTHOUSE: new BuildingType('Court House', COLORS.Brown, 10*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.UNKNOWN, FAME_LEVELS.UNKNOWN, 1),
    CYBER_SURGEON: new BuildingType('Cyber Surgeon', COLORS.DarkCyan, 15*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.NOTORIOUS),
    PALACE: new BuildingType('Palace', COLORS.Gold, 10*1000, FAME_LEVELS.LEGENDARY),
    TEMPLE: new BuildingType('Temple', COLORS.White, 5*1000, FAME_LEVELS.REPUTABLE),
    ARMORY: new BuildingType('Armory', COLORS.DarkGray, 12*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.DISLIKED),
    OUTFITTER: new BuildingType('Outfitter', COLORS.LightGreen, 12*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.DISLIKED),
    CASINO: new BuildingType('Casino', COLORS.Magenta, 20*1000, FAME_LEVELS.UNKNOWN, INFAMY_LEVELS.UNKNOWN, FAME_LEVELS.REPUTABLE),
}
const BUILDING_TYPES_ALL = Object.values(BUILDING_TYPES)