/**
 * Represents a perk type that officers can have.
 * @class PerkType
 */
class PerkType {
    /**
     * @param {string} name - The name of the perk.
     * @param {number[]} color - The color associated with this perk.
     * @param {string} description - A description of the perk's effects.
     */
    constructor(name = '', color = COLORS.White, description = '') {
        /** @type {string} */
        this.name = name;
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.description = description;
    }
}

const PERK_TYPES = {
    LEADERSHIP_1: new PerkType('Leadership I', COLORS.Yellow, 'Allows hiring 1 additional crew member.'),
    LEADERSHIP_2: new PerkType('Leadership II', COLORS.Yellow, 'Allows hiring 2 additional crew members.'),
    LEADERSHIP_3: new PerkType('Leadership III', COLORS.Yellow, 'Allows hiring 3 additional crew members.'),
    LEADERSHIP_4: new PerkType('Leadership IV', COLORS.Yellow, 'Allows hiring 4 additional crew members.'),
    LEADERSHIP_5: new PerkType('Leadership V', COLORS.Yellow, 'Allows hiring 5 additional crew members.'),
    
    HARDENED: new PerkType('Hardened', COLORS.Gray, 'Reduces damage taken from all sources by 10%.'),
    SHARPSHOOTER: new PerkType('Sharpshooter', COLORS.Red, 'Increases laser accuracy and damage by 15%.'),
    ACE_PILOT: new PerkType('Ace Pilot', COLORS.Cyan, 'Increases ship maneuverability and evasion.'),
    ENGINEER: new PerkType('Engineer', COLORS.Orange, 'Repairs hull 20% faster and more efficiently.'),
    NEGOTIATOR: new PerkType('Negotiator', COLORS.Green, 'Improves prices when trading and hiring.'),
    TACTICIAN: new PerkType('Tactician', COLORS.Purple, 'Grants combat initiative bonus in encounters.'),
    SURVIVOR: new PerkType('Survivor', COLORS.LightGreen, 'Reduces chance of being disabled in combat.'),
    LUCKY: new PerkType('Lucky', COLORS.Gold, 'Increases chance of finding rare items and better loot.'),
    INTIMIDATING: new PerkType('Intimidating', COLORS.DarkRed, 'Enemies more likely to surrender or flee.'),
    CHARISMATIC: new PerkType('Charismatic', COLORS.Pink, 'Improves relations with factions and NPCs.'),
    SCAVENGER: new PerkType('Scavenger', COLORS.Brown, 'Finds extra cargo and resources from encounters.'),
    QUICK_LEARNER: new PerkType('Quick Learner', COLORS.LightBlue, 'Gains experience 25% faster.'),
    WEALTHY: new PerkType('Wealthy', COLORS.Yellow, 'Starts with extra credits and earns more from missions.'),
    CONNECTED: new PerkType('Connected', COLORS.Magenta, 'Has better access to exclusive markets and contracts.'),
    COMBAT_VETERAN: new PerkType('Combat Veteran', COLORS.DarkGray, 'Bonus to all combat-related skills and actions.'),
}

const PERK_TYPES_ALL = Object.values(PERK_TYPES)
