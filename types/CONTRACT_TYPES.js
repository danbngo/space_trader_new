/**
 * Represents a type of mission available in the game.
 * @class MissionType
 */
class MissionType {
    /**
     * @param {string} name - The name of the mission type.
     * @param {number[]} color - The color associated with this mission type.
     * @param {string} description - A description of what the mission entails.
     */
    constructor(name = '', color = COLORS.White, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description
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
    ESCORT_CONVOY: new MissionType('Escort Convoy', COLORS.Blue, 'Protect civilian ships from hostile encounters.'),
    
    // Quest Types - Guild
    //the player must find and deliver X units of cargo type Y to planet Z within timeframe
    CARGO_DELIVERY: new MissionType('Cargo Delivery', COLORS.LightBlue, 'Transport specific cargo to a designated planet.'),
    //the player must reach target planet Z within timeframe
    DELIVER_MISSIVE: new MissionType('Deliver Missive', COLORS.Yellow, 'Carry important diplomatic or military messages.'),
    //the player gains temporary officers and must transport them alive to Z within timeframe
    PASSENGER_TRANSPORT: new MissionType('Passenger Transport', COLORS.LightGreen, 'Transport passengers safely to their destination.'),
    //the player must defeat X number of ships of faction type Y within timeframe
    SEEK_AND_DESTROY: new MissionType('Seek and Destroy', COLORS.Red, 'Hunt down and eliminate hostile vessels in the region.'),
    //the player must visit X number of other planets/dwarfs/stations and then return to this planet within timeframe
    PATROL_SECTOR: new MissionType('Patrol Sector', COLORS.DarkCyan, 'Maintain security in a designated space sector.'),
    // Quest Types - Exploration
    SURVEY_MISSION: new MissionType('Survey Mission', COLORS.Green, 'Explore and report on uncharted space regions.'),
    //the player must save X number of abandoned fleets within this timeframe
    RESCUE_OPERATION: new MissionType('Rescue Operation', COLORS.White, 'Locate and rescue stranded ships or personnel.'),
    
    // Quest Types - Trade/Economic - IGNORE FOR NOW
    //TRADE_ROUTE: new MissionType('Trade Route', COLORS.Gold, 'Establish profitable trade connections between planets.'),
    //SMUGGLING_RUN: new MissionType('Smuggling Run', COLORS.DarkGray, 'Transport illegal goods covertly.'),
}

const MISSION_TYPES_ALL = Object.values(MISSION_TYPES)
