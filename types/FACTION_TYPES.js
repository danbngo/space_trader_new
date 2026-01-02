
/**
 * @fileoverview Defines faction types for tracking reputation with various groups.
 * @module types/FACTION_TYPES
 */

/**
 * @class FactionType
 * @classdesc Represents a faction that the player can gain reputation with.
 * @property {string} name - The name of the faction.
 * @property {string} symbol - The symbol representing the faction.
 * @property {number[]} color - The color associated with the faction.
 * @property {string} description - A brief description of the faction.
 * @property {boolean} criminal - Whether this faction is considered criminal.
 * @property {boolean} authority - Whether this faction is considered an authority.
 * @property {boolean} cloaked - Whether this faction is able to be cloaked.
 * @property {FleetType[]} fleetTypes - The types of fleets associated with this faction.
 * @property {number} reputationMultiplier - Reputation change multiplier (positive = good faction, negative = bad faction, affects both victory and attack).
 * @constructor
 */
class FactionType {
    constructor(name = '', symbol = '', color = COLORS.White, description = '', criminal = false, authority = false, cloaked = false, fleetTypes = [], reputationMultiplier = 0) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
        this.description = description;
        this.criminal = criminal;
        this.authority = authority;
        this.cloaked = cloaked;
        this.fleetTypes = fleetTypes;
        this.reputationMultiplier = reputationMultiplier;
    }
}

const FACTION_TYPES = {
    MINERS: new FactionType(
        'Miners',
        '⛏️',
        COLORS.Brown,
        'Independent miners extracting resources from asteroid belts and planetary surfaces.',
        false,
        false,
        false,
        [FLEET_TYPES.MINERS],
        -3  // reputationMultiplier (lose rep for attacking civilians)
    ),
    MERCHANTS: new FactionType(
        'Merchants',
        '💰',
        COLORS.Yellow,
        'Lawful traders moving legal goods between settled worlds.',
        false,
        false,
        false,
        [FLEET_TYPES.MERCHANTS],
        -4  // reputationMultiplier (lose more rep for attacking merchants)
    ),
    SMUGGLERS: new FactionType(
        'Smugglers',
        '📦',
        COLORS.DarkGray,
        'Black market traders dealing in illicit and restricted cargo.',
        true,  
        false, 
        true,
        [FLEET_TYPES.SMUGGLERS],
        2  // reputationMultiplier (small gain for defeating criminals)
    ),
    PIRATES: new FactionType(
        'Pirates',
        '☠️',
        COLORS.Red,
        'Ruthless outlaws who prey on merchant vessels and settlements.',
        true,  
        false, 
        false,
        [FLEET_TYPES.PIRATES],
        5  // reputationMultiplier (good gain for defeating pirates)
    ),
    POLICE: new FactionType(
        'Police',
        '👮',
        COLORS.LightBlue,
        'Law enforcement maintaining order and security in civilized space.',
        false, 
        true,  
        false,
        [FLEET_TYPES.POLICE],
        -5  // reputationMultiplier (lose rep for attacking law enforcement)
    ),
    SOLDIERS: new FactionType(
        'Military',
        '⚔️',
        COLORS.Green,
        'Military forces protecting planets and enforcing government authority.',
        false, 
        true,  
        false,
        [FLEET_TYPES.SOLDIERS],
        -6  // reputationMultiplier (highest loss for attacking military)
    ),
    MERCENARIES: new FactionType(
        'Mercenaries',
        '🗡️',
        COLORS.DarkGreen,
        'Professional soldiers-for-hire who fight for the highest bidder.',
        false,
        false,
        false,
        [FLEET_TYPES.MERCENARIES],
        -2  // reputationMultiplier (slight loss, they're professionals)
    ),
    BOUNTY_HUNTERS: new FactionType(
        'Bounty Hunters',
        '🎯',
        COLORS.DarkBlue,
        'Professional trackers and hunters who capture criminals for profit.',
        false,
        false,
        true,
        [FLEET_TYPES.BOUNTY_HUNTERS],
        -3  // reputationMultiplier (lose rep if you're wanted)
    ),
    TOURISTS: new FactionType(
        'Tourists',
        '🎭',
        COLORS.LightYellow,
        'Pleasure cruisers and sightseers traveling the galaxy for leisure.',
        false,
        false,
        false,
        [FLEET_TYPES.TOURISTS],
        -4  // reputationMultiplier (lose rep for attacking tourists)
    ),
    SLAVERS: new FactionType(
        'Slavers',
        '⛓️',
        COLORS.DarkRed,
        'Ruthless criminals who capture and enslave crews. They are feared throughout the galaxy.',
        true,  
        false, 
        true,
        [FLEET_TYPES.SLAVERS],
        8  // reputationMultiplier (highest gain for defeating slavers - heroes)
    ),
    COLONISTS: new FactionType(
        'Colonists',
        '🏘️',
        COLORS.Magenta,
        'Settlers traveling to establish new colonies. They prefer to avoid trouble and focus on their mission.',
        false,
        false,
        false,
        [FLEET_TYPES.COLONISTS],
        -4  // reputationMultiplier (lose rep for attacking settlers)
    ),
    SCIENTISTS: new FactionType(
        'Scientists',
        '🔬',
        COLORS.LightCyan,
        'Researchers and explorers seeking knowledge and studying the mysteries of the universe.',
        false,
        false,
        false,
        [FLEET_TYPES.SCIENTISTS],
        -3  // reputationMultiplier (lose rep for attacking scientists)
    ),
    PILGRIMS: new FactionType(
        'Pilgrims',
        '🙏',
        COLORS.LightPurple,
        'Devout travelers making religious journeys to holy sites and sacred worlds.',
        false,
        false,
        false,
        [FLEET_TYPES.PILGRIMS],
        -3  // reputationMultiplier (lose rep for attacking pilgrims)
    ),
    INQUISITORS: new FactionType(
        'Inquisitors',
        '⚖️',
        COLORS.DarkPurple,
        'Religious enforcers tasked with rooting out heresy and maintaining doctrinal purity.',
        false,
        true,
        false,
        [FLEET_TYPES.INQUISITORS],
        -5  // reputationMultiplier (lose rep for attacking religious authority)
    ),
    MISSIONARIES: new FactionType(
        'Missionaries',
        '✝️',
        COLORS.Purple,
        'Evangelists spreading their faith to new worlds and converting non-believers.',
        false,
        false,
        false,
        [FLEET_TYPES.MISSIONARIES],
        -3  // reputationMultiplier (lose rep for attacking missionaries)
    ),
    DIPLOMATS: new FactionType(
        'Diplomats',
        '🤝',
        COLORS.White,
        'Official envoys and ambassadors negotiating treaties and maintaining diplomatic relations.',
        false,
        false,
        false,
        [FLEET_TYPES.DIPLOMATS],
        -5  // reputationMultiplier (lose significant rep for attacking diplomats)
    ),
    SALVAGERS: new FactionType(
        'Salvagers',
        '🔧',
        COLORS.Orange,
        'Scavengers who recover valuable materials from wrecks and abandoned stations.',
        false,
        false,
        false,
        [FLEET_TYPES.SALVAGERS],
        -2  // reputationMultiplier (small loss for attacking salvagers)
    ),
    TAX_COLLECTORS: new FactionType(
        'Tax Collectors',
        '💰',
        COLORS.DarkYellow,
        'Government agents collecting taxes and enforcing financial regulations.',
        false,
        false,
        false,
        [FLEET_TYPES.TAX_COLLECTORS],
        -4  // reputationMultiplier (lose rep for attacking government agents)
    ),
    REBELS: new FactionType(
        'Rebels',
        '⚔️',
        COLORS.DarkMagenta,
        'Revolutionary forces fighting against established authority and seeking to overthrow the current regime.',
        false,
        true,
        false,
        [FLEET_TYPES.REBELS],
        1  // reputationMultiplier (slight gain - depends on perspective)
    ),
    REFUGEES: new FactionType(
        'Refugees',
        '🏃',
        COLORS.LightMagenta,
        'Displaced populations fleeing war, persecution, or catastrophe, seeking sanctuary.',
        false,
        false,
        false,
        [FLEET_TYPES.REFUGEES],
        -5  // reputationMultiplier (lose significant rep for attacking refugees)
    ),
}

const FACTION_TYPES_ALL = Object.values(FACTION_TYPES)

const PLAYER_FACTION_TYPE = new FactionType('Player Faction', '🚀', COLORS.LightGray, 'The faction representing the player.')