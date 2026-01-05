/**
 * Represents a type of building that can exist on a planet.
 * @class BuildingType
 */
class BuildingType {
    /**
     * @param {string} name - The name of the building type.
     * @param {number[]} color - The color associated with this building type.
     * @param {RankType} minRank
     */
    constructor(name = '', color = COLORS.White, minRank = RANK_TYPES.NO_RANK, baseCredits = 1) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {RankType} */
        this.minRank = minRank || RANK_TYPES.NO_RANK
        /** @type {number} */
        this.baseCredits = baseCredits
    }

    /**
     * Gets the reason why player cannot access this building, or null if they can access it.
     * Reasons are checked in priority order: not docked, insufficient rank, damaged.
     * @param {Planet} planet - The planet the building is on.
     * @param {Building} building - The building instance.
     * @returns {string|null} The reason for denial, or null if access is allowed.
     */
    static getAccessDeniedReason(planet, building) {
        const buildingType = building.buildingType
        const playerRank = gs.captain.ranks.get(planet) || RANK_TYPES.NO_RANK
        
        // Priority 1: Insufficient rank
        // Check if player has sufficient rank with this planet OR with its sovereign (if it's a subject)
        let hasAccess = playerRank.level >= buildingType.minRank.level
        
        // If player doesn't have access via planet rank, check if planet is a subject
        if (!hasAccess && planet.c && planet.c.relationships) {
            // Find the sovereign (if any) - the body where this planet has SUBJECT relationship
            const allBodies = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.moons, ...gs.system.spaceStations]
            const sovereign = allBodies.find(body => planet.c.relationships.get(body) === RELATIONSHIP_TYPES.SUBJECT)
            
            if (sovereign) {
                const sovereignRank = gs.captain.ranks.get(sovereign) || RANK_TYPES.NO_RANK
                hasAccess = sovereignRank.level >= buildingType.minRank.level
            }
        }
        
        if (!hasAccess) {
            return `Requires ${buildingType.minRank.name} rank or higher.`
        }
        
        // Priority 2: Building damaged
        if (building.damaged) {
            return 'This building is closed for repairs.'
        }
        
        return null
    }
}

const BUILDING_TYPES = {
    COURTHOUSE: new BuildingType('Court House', COLORS.Brown, RANK_TYPES.OUTLAW, 10*1000),
    SHIPYARD: new BuildingType('Shipyard', COLORS.LightGray, RANK_TYPES.NO_RANK, 20*1000),
    BLACK_MARKET: new BuildingType('Black Market', COLORS.Red, RANK_TYPES.VISA, 10*1000),
    MARKET: new BuildingType('Market', COLORS.LightBlue, RANK_TYPES.VISA, 30*1000),
    TAVERN: new BuildingType('Tavern', COLORS.Orange, RANK_TYPES.VISA, 5*1000),
    BANK: new BuildingType('Bank', COLORS.Yellow, RANK_TYPES.CITIZEN, 50*1000),
    GUILD: new BuildingType('Guild', COLORS.Purple, RANK_TYPES.CITIZEN, 10*1000),
    ACADEMY: new BuildingType('Academy', COLORS.Green, RANK_TYPES.CITIZEN, 10*1000),
    TEMPLE: new BuildingType('Temple', COLORS.White, RANK_TYPES.CITIZEN, 5*1000),
    CASINO: new BuildingType('Casino', COLORS.Magenta, RANK_TYPES.ELITE, 20*1000),
    CYBER_SURGEON: new BuildingType('Cyber Surgeon', COLORS.DarkCyan, RANK_TYPES.ELITE, 15*1000),
    GENETICIST: new BuildingType('Geneticist', COLORS.LightGreen, RANK_TYPES.ELITE, 15*1000),
    PALACE: new BuildingType('Palace', COLORS.Gold, RANK_TYPES.ELITE, 10*1000),
}
const BUILDING_TYPES_ALL = Object.values(BUILDING_TYPES)