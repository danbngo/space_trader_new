
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
 * @property {boolean} religious - Whether this faction is religiously affiliated.
 * @property {boolean} cloaked - Whether this faction is able to be cloaked.
 * @property {FleetType[]} fleetTypes - The types of fleets associated with this faction.
 * @property {number} reputationMultiplier - Reputation change multiplier (positive = good faction, negative = bad faction, affects both victory and attack).
 * @property {SkillType[]} favoredSkills - Skills favored by this faction.
 * @constructor
 */
class FactionType {
    constructor(name = '', symbol = '', color = COLORS.White, description = '', criminal = false, authority = false, religious = false, cloaked = false, fleetTypes = [], reputationMultiplier = 0, favoredSkills = []) {
        this.name = name;
        this.symbol = symbol;
        this.color = color;
        this.description = description;
        this.criminal = criminal;
        this.authority = authority;
        this.religious = religious;
        this.cloaked = cloaked;
        this.fleetTypes = fleetTypes;
        this.reputationMultiplier = reputationMultiplier;
        this.favoredSkills = favoredSkills;
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
        false,
        [FLEET_TYPES.MINERS],
        -1,  // reputationMultiplier (lose rep for attacking civilians)
        [SKILLS.Engineer]
    ),
    MERCHANTS: new FactionType(
        'Merchants',
        '💰',
        COLORS.Yellow,
        'Lawful traders moving legal goods between settled worlds.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.MERCHANTS],
        -1,  // reputationMultiplier (lose more rep for attacking merchants)
        [SKILLS.Barter]
    ),
    SMUGGLERS: new FactionType(
        'Smugglers',
        '📦',
        COLORS.DarkGray,
        'Black market traders dealing in illicit and restricted cargo.',
        true,  
        false, 
        false,
        true,
        [FLEET_TYPES.SMUGGLERS],
        1,  // reputationMultiplier (small gain for defeating criminals)
        [SKILLS.Stealth]
    ),
    PIRATES: new FactionType(
        'Pirates',
        '☠️',
        COLORS.Red,
        'Ruthless outlaws who prey on merchant vessels and settlements.',
        true,  
        false, 
        false,
        false,
        [FLEET_TYPES.PIRATES],
        3,  // reputationMultiplier (good gain for defeating pirates)
        [SKILLS.Gunner, SKILLS.Stealth]
    ),
    POLICE: new FactionType(
        'Police',
        '👮',
        COLORS.LightBlue,
        'Law enforcement maintaining order and security in civilized space.',
        false, 
        true,  
        false,
        false,
        [FLEET_TYPES.POLICE],
        -3,  // reputationMultiplier (lose rep for attacking law enforcement)
        [SKILLS.Pilot, SKILLS.Gunner, SKILLS.Negotiation]
    ),
    SOLDIERS: new FactionType(
        'Military',
        '⚔️',
        COLORS.Green,
        'Military forces protecting planets and enforcing government authority.',
        false, 
        true,  
        false,
        false,
        [FLEET_TYPES.SOLDIERS],
        -5,  // reputationMultiplier (highest loss for attacking military)
        [SKILLS.Gunner]
    ),
    MERCENARIES: new FactionType(
        'Mercenaries',
        '🗡️',
        COLORS.DarkGreen,
        'Professional soldiers-for-hire who fight for the highest bidder.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.MERCENARIES],
        0,  // reputationMultiplier (slight loss, they're professionals)
        [SKILLS.Gunner, SKILLS.Salvage]
    ),
    BOUNTY_HUNTERS: new FactionType(
        'Bounty Hunters',
        '🎯',
        COLORS.DarkBlue,
        'Professional trackers and hunters who capture criminals for profit.',
        false,
        false,
        false,
        true,
        [FLEET_TYPES.BOUNTY_HUNTERS],
        0,  // reputationMultiplier (lose rep if you're wanted)
        [SKILLS.Stealth, SKILLS.Gunner, SKILLS.Pilot]
    ),
    TOURISTS: new FactionType(
        'Tourists',
        '🎭',
        COLORS.LightYellow,
        'Pleasure cruisers and sightseers traveling the galaxy for leisure.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.TOURISTS],
        -1,  // reputationMultiplier (lose rep for attacking tourists)
        []
    ),
    SLAVERS: new FactionType(
        'Slavers',
        '⛓️',
        COLORS.DarkRed,
        'Ruthless criminals who capture and enslave crews. They are feared throughout the galaxy.',
        true,  
        false, 
        false,
        true,
        [FLEET_TYPES.SLAVERS],
        5,  // reputationMultiplier (highest gain for defeating slavers - heroes)
        [SKILLS.Stealth, SKILLS.Barter]
    ),
    COLONISTS: new FactionType(
        'Colonists',
        '🏘️',
        COLORS.Magenta,
        'Settlers traveling to establish new colonies. They prefer to avoid trouble and focus on their mission.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.COLONISTS],
        -2,  // reputationMultiplier (lose rep for attacking settlers)
        []
    ),
    SCIENTISTS: new FactionType(
        'Scientists',
        '🔬',
        COLORS.LightCyan,
        'Researchers and explorers seeking knowledge and studying the mysteries of the universe.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.SCIENTISTS],
        -1,  // reputationMultiplier (lose rep for attacking scientists)
        [SKILLS.Science]
    ),
    PILGRIMS: new FactionType(
        'Pilgrims',
        '🙏',
        COLORS.LightPurple,
        'Devout travelers making religious journeys to holy sites and sacred worlds.',
        false,
        false,
        true,
        false,
        [FLEET_TYPES.PILGRIMS],
        -2,  // reputationMultiplier (lose rep for attacking pilgrims)
        []
    ),
    INQUISITORS: new FactionType(
        'Inquisitors',
        '⚖️',
        COLORS.DarkPurple,
        'Religious enforcers tasked with rooting out heresy and maintaining doctrinal purity.',
        false,
        true,
        true,
        false,
        [FLEET_TYPES.INQUISITORS],
        0,  // reputationMultiplier (lose rep for attacking religious authority)
        [SKILLS.Gunner, SKILLS.Negotiation]
    ),
    MISSIONARIES: new FactionType(
        'Missionaries',
        '✝️',
        COLORS.Purple,
        'Evangelists spreading their faith to new worlds and converting non-believers.',
        false,
        false,
        true,
        false,
        [FLEET_TYPES.MISSIONARIES],
        -2,  // reputationMultiplier (lose rep for attacking missionaries)
        [SKILLS.Negotiation]
    ),
    DIPLOMATS: new FactionType(
        'Diplomats',
        '🤝',
        COLORS.White,
        'Official envoys and ambassadors negotiating treaties and maintaining diplomatic relations.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.DIPLOMATS],
        -5, // reputationMultiplier (lose significant rep for attacking diplomats)
        [SKILLS.Negotiation]
    ),
    SALVAGERS: new FactionType(
        'Salvagers',
        '🔧',
        COLORS.Orange,
        'Scavengers who recover valuable materials from wrecks and abandoned stations.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.SALVAGERS],
        -1,  // reputationMultiplier (small loss for attacking salvagers)
        [SKILLS.Salvage]
    ),
    TAX_COLLECTORS: new FactionType(
        'Tax Collectors',
        '💰',
        COLORS.DarkYellow,
        'Government agents collecting taxes and enforcing financial regulations.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.TAX_COLLECTORS],
        -3,  // reputationMultiplier (lose rep for attacking government agents)
        [SKILLS.Barter, SKILLS.Negotiation]
    ),
    REBELS: new FactionType(
        'Rebels',
        '⚔️',
        COLORS.DarkMagenta,
        'Revolutionary forces fighting against established authority and seeking to overthrow the current regime.',
        false,
        true,
        false,
        false,
        [FLEET_TYPES.REBELS],
        -1,  // reputationMultiplier (slight gain - depends on perspective)
        [SKILLS.Gunner, SKILLS.Stealth]
    ),
    REFUGEES: new FactionType(
        'Refugees',
        '🏃',
        COLORS.LightMagenta,
        'Displaced populations fleeing war, persecution, or catastrophe, seeking sanctuary.',
        false,
        false,
        false,
        false,
        [FLEET_TYPES.REFUGEES],
        -5,  // reputationMultiplier (lose significant rep for attacking refugees)
        []
    ),
    SYNDICATES: new FactionType(
        'Syndicates',
        '🎭',
        COLORS.LightRed,
        'Organized crime networks dealing in illegal goods and extorting protection money.',
        true,  
        false,
        false, 
        true,
        [FLEET_TYPES.SYNDICATES],
        3,  // reputationMultiplier (good gain for defeating criminals)
        [SKILLS.Negotiation, SKILLS.Stealth]
    ),
}

const FACTION_TYPES_ALL = Object.values(FACTION_TYPES)

const PLAYER_FACTION_TYPE = new FactionType('Player Faction', '🚀', COLORS.LightGray, 'The faction representing the player.')