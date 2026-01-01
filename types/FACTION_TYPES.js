
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
 * @property {boolean} criminal
 * @property {boolean} authority
 * @property {FleetType[]} fleetTypes - The types of fleets associated with this faction.
 * @constructor
 */
class FactionType {
    constructor(name = '', symbol = '', color = COLORS.White, description = '', criminal = false, authority = false, fleetTypes = []) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
        this.description = description;
        this.criminal = criminal;
        this.authority = authority;
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
        [FLEET_TYPES.MINERS]
    ),
    MERCHANTS: new FactionType(
        'Merchants',
        '💰',
        COLORS.Yellow,
        'Lawful traders moving legal goods between settled worlds.',
        false,
        false,
        [FLEET_TYPES.MERCHANTS]
    ),
    SMUGGLERS: new FactionType(
        'Smugglers',
        '📦',
        COLORS.DarkOrange,
        'Black market traders dealing in illicit and restricted cargo.',
        true,  // criminal
        false, // authority
        [FLEET_TYPES.SMUGGLERS]
    ),
    PIRATES: new FactionType(
        'Pirates',
        '☠️',
        COLORS.LightRed,
        'Ruthless outlaws who prey on merchant vessels and settlements.',
        true,  // criminal
        false, // authority
        [FLEET_TYPES.PIRATES]
    ),
    POLICE: new FactionType(
        'Police',
        '👮',
        COLORS.LightBlue,
        'Law enforcement maintaining order and security in civilized space.',
        false, // criminal
        true,  // authority
        [FLEET_TYPES.POLICE]
    ),
    SOLDIERS: new FactionType(
        'Military',
        '⚔️',
        COLORS.LightGreen,
        'Military forces protecting planets and enforcing government authority.',
        false, // criminal
        true,  // authority
        [FLEET_TYPES.SOLDIERS]
    ),
    BOUNTY_HUNTERS: new FactionType(
        'Bounty Hunters',
        '🎯',
        hexToRgba('#ff6600'),
        'Professional trackers and hunters who capture criminals for profit.',
        false,
        false,
        [FLEET_TYPES.BOUNTY_HUNTERS]
    ),
    TOURISTS: new FactionType(
        'Tourists',
        '🎭',
        COLORS.LightOrange,
        'Pleasure cruisers and sightseers traveling the galaxy for leisure.',
        false,
        false,
        [FLEET_TYPES.TOURISTS]
    ),
    SLAVERS: new FactionType(
        'Slavers',
        '⛓️',
        COLORS.DarkRed,
        'Ruthless criminals who capture and enslave crews. They are feared throughout the galaxy.',
        true,  // criminal
        false, // authority
        [FLEET_TYPES.SLAVERS]
    ),
    COLONISTS: new FactionType(
        'Colonists',
        '🏘️',
        COLORS.LightGreen,
        'Settlers traveling to establish new colonies. They prefer to avoid trouble and focus on their mission.',
        false,
        false,
        [FLEET_TYPES.COLONISTS]
    ),
    SCIENTISTS: new FactionType(
        'Scientists',
        '🔬',
        COLORS.Cyan,
        'Researchers and explorers seeking knowledge and studying the mysteries of the universe.',
        false,
        false,
        [FLEET_TYPES.SCIENTISTS]
    ),
    PILGRIMS: new FactionType(
        'Pilgrims',
        '🙏',
        COLORS.White,
        'Devout travelers making religious journeys to holy sites and sacred worlds.',
        false,
        false,
        [FLEET_TYPES.PILGRIMS]
    ),
    INQUISITORS: new FactionType(
        'Inquisitors',
        '⚖️',
        COLORS.Purple,
        'Religious enforcers tasked with rooting out heresy and maintaining doctrinal purity.',
        false,
        false,
        [FLEET_TYPES.INQUISITORS]
    ),
    MISSIONARIES: new FactionType(
        'Missionaries',
        '✝️',
        COLORS.LightYellow,
        'Evangelists spreading their faith to new worlds and converting non-believers.',
        false,
        false,
        [FLEET_TYPES.MISSIONARIES]
    ),
}

const FACTION_TYPES_ALL = Object.values(FACTION_TYPES)

const PLAYER_FACTION_TYPE = new FactionType('Player Faction', '🚀', COLORS.LightGray, 'The faction representing the player.')