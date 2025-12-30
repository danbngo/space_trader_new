
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
 * @constructor
 */
class FactionType {
    constructor(name = '', symbol = '', color = COLORS.White, description = '') {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
        this.description = description;
    }
}

const FACTION_TYPES = {
    MINERS: new FactionType(
        'Miners Guild',
        '⛏️',
        COLORS.Brown,
        'Independent miners extracting resources from asteroid belts and planetary surfaces.'
    ),
    MERCHANTS: new FactionType(
        'Merchant League',
        '💰',
        COLORS.Yellow,
        'Lawful traders moving legal goods between settled worlds.'
    ),
    SMUGGLERS: new FactionType(
        'Smuggler Syndicate',
        '📦',
        hexToRgba('#ff9900'),
        'Black market traders dealing in illicit and restricted cargo.'
    ),
    PIRATES: new FactionType(
        'Pirate Clans',
        '☠️',
        COLORS.LightRed,
        'Ruthless outlaws who prey on merchant vessels and settlements.'
    ),
    POLICE: new FactionType(
        'System Police',
        '👮',
        COLORS.LightBlue,
        'Law enforcement maintaining order and security in civilized space.'
    ),
    SOLDIERS: new FactionType(
        'Planetary Defense Forces',
        '⚔️',
        COLORS.LightGreen,
        'Military forces protecting planets and enforcing government authority.'
    ),
    BOUNTY_HUNTERS: new FactionType(
        'Bounty Hunters Guild',
        '🎯',
        hexToRgba('#ff6600'),
        'Professional trackers and hunters who capture criminals for profit.'
    ),
    TOURISTS: new FactionType(
        'Tourist Bureau',
        '🎭',
        COLORS.LightOrange,
        'Pleasure cruisers and sightseers traveling the galaxy for leisure.'
    ),
    SLAVERS: new FactionType(
        'Slaver Cartels',
        '⛓️',
        COLORS.DarkRed,
        'Ruthless criminals who capture and enslave crews. They are feared throughout the galaxy.'
    ),
    COLONISTS: new FactionType(
        'Colonists',
        '🏘️',
        COLORS.LightGreen,
        'Settlers traveling to establish new colonies. They prefer to avoid trouble and focus on their mission.'
    ),
}

const FACTION_TYPES_ALL = Object.values(FACTION_TYPES)
