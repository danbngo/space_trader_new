/**
 * Represents a perk type that officers can have.
 * @class PerkType
 */
class PerkType {
    /**
     * @param {string} name - The name of the perk.
     * @param {number[]} color - The color associated with this perk.
     * @param {string} description - A description of the perk's effects.
     * @param {number} minLevel - Minimum officer level required to take this perk.
     */
    constructor(name = '', color = COLORS.White, description = '', minLevel = 1) {
        /** @type {string} */
        this.name = name;
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description;
        /** @type {number} */
        this.minLevel = minLevel;
    }
}

const PERK_TYPES = {
    LEADERSHIP_1: new PerkType('Leadership I', COLORS.Yellow, 'Allows hiring 1 additional crew member.', 1),
    LEADERSHIP_2: new PerkType('Leadership II', COLORS.Yellow, 'Allows hiring 2 additional crew members.', 5),
    LEADERSHIP_3: new PerkType('Leadership III', COLORS.Yellow, 'Allows hiring 3 additional crew members.', 10),
    LEADERSHIP_4: new PerkType('Leadership IV', COLORS.Yellow, 'Allows hiring 4 additional crew members.', 15),
    LEADERSHIP_5: new PerkType('Leadership V', COLORS.Yellow, 'Allows hiring 5 additional crew members.', 20),
    
    HARDENED: new PerkType('Hardened', COLORS.Gray, 'Reduces damage taken from all sources by 10%.', 3),
    SHARPSHOOTER: new PerkType('Sharpshooter', COLORS.Red, 'Increases laser accuracy and damage by 15%.', 4),
    ACE_PILOT: new PerkType('Ace Pilot', COLORS.Cyan, 'Increases ship maneuverability and evasion.', 5),
    ENGINEER: new PerkType('Engineer', COLORS.Orange, 'Repairs hull 20% faster and more efficiently.', 3),
    NEGOTIATOR: new PerkType('Negotiator', COLORS.Green, 'Improves prices when trading and hiring.', 6),
    TACTICIAN: new PerkType('Tactician', COLORS.Purple, 'Grants combat initiative bonus in encounters.', 8),
    SURVIVOR: new PerkType('Survivor', COLORS.LightGreen, 'Reduces chance of being disabled in combat.', 7),
    LUCKY: new PerkType('Lucky', COLORS.Gold, 'Increases chance of finding rare items and better loot.', 5),
    INTIMIDATING: new PerkType('Intimidating', COLORS.DarkRed, 'Enemies more likely to surrender or flee.', 9),
    CHARISMATIC: new PerkType('Charismatic', COLORS.Pink, 'Improves relations with factions and NPCs.', 4),
    SCAVENGER: new PerkType('Scavenger', COLORS.Brown, 'Finds extra cargo and resources from encounters.', 2),
    QUICK_LEARNER: new PerkType('Quick Learner', COLORS.LightBlue, 'Gains experience 25% faster.', 1),
    WEALTHY: new PerkType('Wealthy', COLORS.Yellow, 'Starts with extra credits and earns more from missions.', 1),
    CONNECTED: new PerkType('Connected', COLORS.Magenta, 'Has better access to exclusive markets and contracts.', 12),
    COMBAT_VETERAN: new PerkType('Combat Veteran', COLORS.DarkGray, 'Bonus to all combat-related skills and actions.', 10),
}

const PERK_TYPES_ALL = Object.values(PERK_TYPES)
