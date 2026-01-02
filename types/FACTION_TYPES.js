
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
 * @constructor
 */
class FactionType {
    constructor(name = '', symbol = '', color = COLORS.White, description = '', criminal = false, authority = false, cloaked = false, fleetTypes = []) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
        this.description = description;
        this.criminal = criminal;
        this.authority = authority;
        this.cloaked = cloaked;
        this.fleetTypes = fleetTypes;
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
        [FLEET_TYPES.MINERS]
    ),
    MERCHANTS: new FactionType(
        'Merchants',
        '💰',
        COLORS.Yellow,
        'Lawful traders moving legal goods between settled worlds.',
        false,
        false,
        false,
        [FLEET_TYPES.MERCHANTS]
    ),
    SMUGGLERS: new FactionType(
        'Smugglers',
        '📦',
        COLORS.DarkGray,
        'Black market traders dealing in illicit and restricted cargo.',
        true,  
        false, 
        true,
        [FLEET_TYPES.SMUGGLERS]
    ),
    PIRATES: new FactionType(
        'Pirates',
        '☠️',
        COLORS.Red,
        'Ruthless outlaws who prey on merchant vessels and settlements.',
        true,  
        false, 
        false,
        [FLEET_TYPES.PIRATES]
    ),
    POLICE: new FactionType(
        'Police',
        '👮',
        COLORS.LightBlue,
        'Law enforcement maintaining order and security in civilized space.',
        false, 
        true,  
        false,
        [FLEET_TYPES.POLICE]
    ),
    SOLDIERS: new FactionType(
        'Military',
        '⚔️',
        COLORS.Green,
        'Military forces protecting planets and enforcing government authority.',
        false, 
        true,  
        false,
        [FLEET_TYPES.SOLDIERS]
    ),
    BOUNTY_HUNTERS: new FactionType(
        'Bounty Hunters',
        '🎯',
        COLORS.DarkBlue,
        'Professional trackers and hunters who capture criminals for profit.',
        false,
        false,
        true,
        [FLEET_TYPES.BOUNTY_HUNTERS]
    ),
    TOURISTS: new FactionType(
        'Tourists',
        '🎭',
        COLORS.LightYellow,
        'Pleasure cruisers and sightseers traveling the galaxy for leisure.',
        false,
        false,
        false,
        [FLEET_TYPES.TOURISTS]
    ),
    SLAVERS: new FactionType(
        'Slavers',
        '⛓️',
        COLORS.DarkRed,
        'Ruthless criminals who capture and enslave crews. They are feared throughout the galaxy.',
        true,  
        false, 
        true,
        [FLEET_TYPES.SLAVERS]
    ),
    COLONISTS: new FactionType(
        'Colonists',
        '🏘️',
        COLORS.Magenta,
        'Settlers traveling to establish new colonies. They prefer to avoid trouble and focus on their mission.',
        false,
        false,
        false,
        [FLEET_TYPES.COLONISTS]
    ),
    SCIENTISTS: new FactionType(
        'Scientists',
        '🔬',
        COLORS.LightCyan,
        'Researchers and explorers seeking knowledge and studying the mysteries of the universe.',
        false,
        false,
        false,
        [FLEET_TYPES.SCIENTISTS]
    ),
    PILGRIMS: new FactionType(
        'Pilgrims',
        '🙏',
        COLORS.LightPurple,
        'Devout travelers making religious journeys to holy sites and sacred worlds.',
        false,
        false,
        false,
        [FLEET_TYPES.PILGRIMS]
    ),
    INQUISITORS: new FactionType(
        'Inquisitors',
        '⚖️',
        COLORS.DarkPurple,
        'Religious enforcers tasked with rooting out heresy and maintaining doctrinal purity.',
        false,
        true,
        false,
        [FLEET_TYPES.INQUISITORS]
    ),
    MISSIONARIES: new FactionType(
        'Missionaries',
        '✝️',
        COLORS.Purple,
        'Evangelists spreading their faith to new worlds and converting non-believers.',
        false,
        false,
        false,
        [FLEET_TYPES.MISSIONARIES]
    ),
    DIPLOMATS: new FactionType(
        'Diplomats',
        '🤝',
        COLORS.White,
        'Official envoys and ambassadors negotiating treaties and maintaining diplomatic relations.',
        false,
        false,
        false,
        [FLEET_TYPES.DIPLOMATS]
    ),
    SALVAGERS: new FactionType(
        'Salvagers',
        '🔧',
        COLORS.Orange,
        'Scavengers who recover valuable materials from wrecks and abandoned stations.',
        false,
        false,
        false,
        [FLEET_TYPES.SALVAGERS]
    ),
    TAX_COLLECTORS: new FactionType(
        'Tax Collectors',
        '💰',
        COLORS.DarkYellow,
        'Government agents collecting taxes and enforcing financial regulations.',
        false,
        false,
        false,
        [FLEET_TYPES.TAX_COLLECTORS]
    ),
    REBELS: new FactionType(
        'Rebels',
        '⚔️',
        COLORS.DarkMagenta,
        'Revolutionary forces fighting against established authority and seeking to overthrow the current regime.',
        false,
        true,
        false,
        [FLEET_TYPES.REBELS]
    ),
    REFUGEES: new FactionType(
        'Refugees',
        '🏃',
        COLORS.LightMagenta,
        'Displaced populations fleeing war, persecution, or catastrophe, seeking sanctuary.',
        false,
        false,
        false,
        [FLEET_TYPES.REFUGEES]
    ),
}

const FACTION_TYPES_ALL = Object.values(FACTION_TYPES)

const PLAYER_FACTION_TYPE = new FactionType('Player Faction', '🚀', COLORS.LightGray, 'The faction representing the player.')