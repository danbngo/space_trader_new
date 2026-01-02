/**
 * Represents a type of contract available in the game.
 * @class ContractType
 */
class ContractType {
    /**
     * @param {string} name - The name of the contract type.
     * @param {number[]} color - The color associated with this contract type.
     * @param {string} description - A description of what the contract entails.
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

const CONTRACT_TYPES = {
    // Licenses and Permissions
    LETTER_OF_MARQUE: new ContractType('Letter of Marque', COLORS.Red, 'Official authorization to attack enemy vessels and claim bounties.'),
    MERCHANT_LICENSE: new ContractType('Merchant License', COLORS.Gold, 'Grants reduced trade taxes and access to exclusive markets.'),
    MINING_PERMIT: new ContractType('Mining Permit', COLORS.LightGray, 'Authorization to extract resources from asteroid belts.'),
    DIPLOMATIC_PASS: new ContractType('Diplomatic Pass', COLORS.Purple, 'Safe passage through hostile territory.'),
    
    // Quest Types - Delivery
    CARGO_DELIVERY: new ContractType('Cargo Delivery', COLORS.LightBlue, 'Transport specific cargo to a designated planet.'),
    URGENT_DELIVERY: new ContractType('Urgent Delivery', COLORS.Orange, 'Time-sensitive delivery mission with bonus payment.'),
    DELIVER_MISSIVE: new ContractType('Deliver Missive', COLORS.Yellow, 'Carry important diplomatic or military messages.'),
    PASSENGER_TRANSPORT: new ContractType('Passenger Transport', COLORS.LightGreen, 'Transport passengers safely to their destination.'),
    
    // Quest Types - Combat
    DESTROY_PIRATES: new ContractType('Destroy Pirates', COLORS.Red, 'Hunt down and eliminate pirate vessels in the region.'),
    BOUNTY_HUNT: new ContractType('Bounty Hunt', COLORS.DarkRed, 'Track and capture a specific criminal target.'),
    ESCORT_CONVOY: new ContractType('Escort Convoy', COLORS.Blue, 'Protect merchant ships from hostile encounters.'),
    PATROL_SECTOR: new ContractType('Patrol Sector', COLORS.DarkCyan, 'Maintain security in a designated space sector.'),
    
    // Quest Types - Exploration
    SURVEY_MISSION: new ContractType('Survey Mission', COLORS.Green, 'Explore and report on uncharted space regions.'),
    RESCUE_OPERATION: new ContractType('Rescue Operation', COLORS.White, 'Locate and rescue stranded ships or personnel.'),
    
    // Quest Types - Trade/Economic
    TRADE_ROUTE: new ContractType('Trade Route', COLORS.Gold, 'Establish profitable trade connections between planets.'),
    SMUGGLING_RUN: new ContractType('Smuggling Run', COLORS.DarkGray, 'Transport illegal goods covertly.'),
}

const CONTRACT_TYPES_ALL = Object.values(CONTRACT_TYPES)
