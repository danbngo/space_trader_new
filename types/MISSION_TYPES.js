/**
 * Represents a type of mission available in the game.
 * @class MissionType
 */
class MissionType {
    /**
     * @param {Object} params - Mission type parameters
     * @param {string} params.name - The name of the mission type
     * @param {number[]} params.color - The color associated with this mission type
     * @param {string} params.description - A description of what the mission entails
     * @param {FactionType[]} params.factionTypes - Faction types this mission can target (empty for any)
     * @param {number} params.minDuration - Minimum mission duration in years
     * @param {number} params.maxDuration - Maximum mission duration in years
     * @param {number} params.baseReward - Base reward in credits
     * @param {number} params.minAmount - Minimum amount (cargo, ships, etc.)
     * @param {number} params.maxAmount - Maximum amount (cargo, ships, etc.)
     */
    constructor({name = '', color = COLORS.White, description = '', factionTypes = [], minDuration = 1/365, maxDuration = 30/365, baseReward = 1000, minAmount = 1, maxAmount = 10}) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.description = description
        /** @type {FactionType[]} */
        this.factionTypes = factionTypes
        /** @type {number} */
        this.minDuration = minDuration
        /** @type {number} */
        this.maxDuration = maxDuration
        /** @type {number} */
        this.baseReward = baseReward
        /** @type {number} */
        this.minAmount = minAmount
        /** @type {number} */
        this.maxAmount = maxAmount
    }
    
    /**
     * Calculate mission reward based on amount and duration
     * @param {number} amount - The amount for this mission instance
     * @param {number} duration - The duration for this mission instance in years
     * @returns {number} The calculated reward
     */
    calcReward(amount, duration) {
        const amountRatio = (amount - this.minAmount) / (this.maxAmount - this.minAmount)
        const durationRatio = (duration - this.minDuration) / (this.maxDuration - this.minDuration)
        return Math.round(this.baseReward * (1 + amountRatio) * (2 - durationRatio))
    }
}

const MISSION_TYPES = {
    // Licenses and Permissions - IGNORE THIS SECTION FOR NOW
    /*LETTER_OF_MARQUE: new MissionType('Letter of Marque', COLORS.Red, 'Official authorization to attack enemy vessels and claim bounties.'),
    MERCHANT_LICENSE: new MissionType('Merchant License', COLORS.Gold, 'Grants reduced trade taxes and access to exclusive markets.'),
    MINING_PERMIT: new MissionType('Mining Permit', COLORS.LightGray, 'Authorization to extract resources from asteroid belts.'),
    DIPLOMATIC_IMMUNITY: new MissionType('Diplomatic Immunity', COLORS.Purple, 'Safe passage through hostile territory.'),*/
    
    // Quest Types - Caravansery
    //the player must ensure fleet Y reaches Z within timeframe. the player must never stop escorting fleet Y unless it dies/reaches.
    ESCORT_CONVOY: new MissionType({
        name: 'Escort Convoy',
        color: COLORS.Blue,
        description: 'Protect civilian ships from hostile encounters.',
        factionTypes: [FACTION_TYPES.MERCHANTS, FACTION_TYPES.COLONISTS, FACTION_TYPES.PILGRIMS],
        minDuration: 60/365,
        maxDuration: 120/365,
        baseReward: 3000,
        minAmount: 1,
        maxAmount: 1
    }),
    
    // Quest Types - Guild
    //the player must find and deliver X units of cargo type Y to planet Z within timeframe
    CARGO_DELIVERY: new MissionType({
        name: 'Cargo Delivery',
        color: COLORS.LightBlue,
        description: 'Transport specific cargo to a designated planet.',
        factionTypes: [],
        minDuration: 60/365,
        maxDuration: 120/365,
        baseReward: 4000,
        minAmount: 10,
        maxAmount: 100
    }),
    //the player must reach target planet Z within timeframe
    DELIVER_MISSIVE: new MissionType({
        name: 'Deliver Missive',
        color: COLORS.Yellow,
        description: 'Carry important diplomatic or military messages.',
        factionTypes: [],
        minDuration: 60/365,
        maxDuration: 120/365,
        baseReward: 1000,
        minAmount: 1,
        maxAmount: 1
    }),
    //the player must defeat X number of ships of faction type Y within timeframe
    SEEK_AND_DESTROY: new MissionType({
        name: 'Seek and Destroy',
        color: COLORS.Red,
        description: 'Hunt down and eliminate hostile vessels in the region.',
        factionTypes: [FACTION_TYPES.PIRATES, FACTION_TYPES.REBELS, FACTION_TYPES.SMUGGLERS, FACTION_TYPES.SLAVERS],
        minDuration: 60/365,
        maxDuration: 120/365,
        baseReward: 8000,
        minAmount: 1,
        maxAmount: 3
    }),
    //the player must visit X number of other planets/dwarfs/stations and then return to this planet within timeframe
    PATROL_SECTOR: new MissionType({
        name: 'Patrol Sector',
        color: COLORS.DarkCyan,
        description: 'Maintain security in a designated space sector.',
        factionTypes: [],
        minDuration: 60/365,
        maxDuration: 120/365,
        baseReward: 6000,
        minAmount: 2,
        maxAmount: 4
    }),
    // the player 
    //SURVEY_MISSION: new MissionType('Survey Mission', COLORS.Green, 'Explore and report on uncharted space regions.'),
    //the player must save X number of abandoned fleets within this timeframe
    //RESCUE_OPERATION: new MissionType('Rescue Operation', COLORS.White, 'Locate and rescue stranded ships or personnel.'),
    
    // Quest Types - Trade/Economic - IGNORE FOR NOW
    //TRADE_ROUTE: new MissionType('Trade Route', COLORS.Gold, 'Establish profitable trade connections between planets.'),
    //SMUGGLING_RUN: new MissionType('Smuggling Run', COLORS.DarkGray, 'Transport illegal goods covertly.'),
}

const MISSION_TYPES_ALL = Object.values(MISSION_TYPES)
