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
    LEADERSHIP_1: new PerkType('Leadership I', COLORS.LightPurple, 'Allows hiring 1 additional crew member.', 1),
    LEADERSHIP_2: new PerkType('Leadership II', COLORS.LightPurple, 'Allows hiring 2 additional crew members.', 5),
    LEADERSHIP_3: new PerkType('Leadership III', COLORS.LightPurple, 'Allows hiring 3 additional crew members.', 10),
    LEADERSHIP_4: new PerkType('Leadership IV', COLORS.LightPurple, 'Allows hiring 4 additional crew members.', 15),
    LEADERSHIP_5: new PerkType('Leadership V', COLORS.LightPurple, 'Allows hiring 5 additional crew members.', 20),

    SKILLED_1: new PerkType('Skilled I', COLORS.LightGray, 'Grants 1 additional skill point per levelup.', 1),
    SKILLED_2: new PerkType('Skilled II', COLORS.LightGray, 'Grants 2 additional skill points per levelup.', 5),
    SKILLED_3: new PerkType('Skilled III', COLORS.LightGray, 'Grants 3 additional skill points per levelup.', 10),
    SKILLED_4: new PerkType('Skilled IV', COLORS.LightGray, 'Grants 4 additional skill points per levelup.', 15),
    SKILLED_5: new PerkType('Skilled V', COLORS.LightGray, 'Grants 5 additional skill points per levelup.', 20),

    CYBER_SOLDIER_1: new PerkType('Cyber Soldier I', COLORS.DarkCyan, 'Increases effectiveness of cybernetic implants by 20%.', 1),
    CYBER_SOLDIER_2: new PerkType('Cyber Soldier II', COLORS.DarkCyan, 'Increases effectiveness of cybernetic implants by 40%.', 5),
    CYBER_SOLDIER_3: new PerkType('Cyber Soldier III', COLORS.DarkCyan, 'Increases effectiveness of cybernetic implants by 60%.', 10),
    CYBER_SOLDIER_4: new PerkType('Cyber Soldier IV', COLORS.DarkCyan, 'Increases effectiveness of cybernetic implants by 80%.', 15),
    CYBER_SOLDIER_5: new PerkType('Cyber Soldier V', COLORS.DarkCyan, 'Increases effectiveness of cybernetic implants by 100%.', 20),

    CYBER_CAPACITY_1: new PerkType('Cyber Capacity I', COLORS.LightCyan, 'Increase number of cybernetic implant slots by 1.', 1),
    CYBER_CAPACITY_2: new PerkType('Cyber Capacity II', COLORS.LightCyan, 'Increase number of cybernetic implant slots by 2.', 5),
    CYBER_CAPACITY_3: new PerkType('Cyber Capacity III', COLORS.LightCyan, 'Increase number of cybernetic implant slots by 3.', 10),
    CYBER_CAPACITY_4: new PerkType('Cyber Capacity IV', COLORS.LightCyan, 'Increase number of cybernetic implant slots by 4.', 15),
    CYBER_CAPACITY_5: new PerkType('Cyber Capacity V', COLORS.LightCyan, 'Increase number of cybernetic implant slots by 5.', 20),

    MUTATION_1: new PerkType('Mutation I', COLORS.Green, 'Gain a random genetic modification. This does not count against the genetic modification limit.', 1),
    MUTATION_2: new PerkType('Mutation II', COLORS.Green, 'Gain a random genetic modification. This does not count against the genetic modification limit.', 5),
    MUTATION_3: new PerkType('Mutation III', COLORS.Green, 'Gain a random genetic modification. This does not count against the genetic modification limit.', 10),
    MUTATION_4: new PerkType('Mutation IV', COLORS.Green, 'Gain a random genetic modification. This does not count against the genetic modification limit.', 15),
    MUTATION_5: new PerkType('Mutation V', COLORS.Green, 'Gain a random genetic modification. This does not count against the genetic modification limit.', 20),
    
    GENE_SOLDIER_1: new PerkType('Gene Soldier I', COLORS.Cyan, 'Increases effectiveness of mutations by 20%.', 1),
    GENE_SOLDIER_2: new PerkType('Gene Soldier II', COLORS.Cyan, 'Increases effectiveness of mutations by 40%.', 5),
    GENE_SOLDIER_3: new PerkType('Gene Soldier III', COLORS.Cyan, 'Increases effectiveness of mutations by 60%.', 10),
    GENE_SOLDIER_4: new PerkType('Gene Soldier IV', COLORS.Cyan, 'Increases effectiveness of mutations by 80%.', 15),
    GENE_SOLDIER_5: new PerkType('Gene Soldier V', COLORS.Cyan, 'Increases effectiveness of mutations by 100%.', 20),

    HARDENED: new PerkType('Hardened', COLORS.Gray, 'Reduces damage taken from all sources by 10%.', 3),
    SHARPSHOOTER: new PerkType('Sharpshooter', COLORS.Red, 'Increases laser accuracy and damage by 15%.', 4),
    ACE_PILOT: new PerkType('Ace Pilot', COLORS.Blue, 'Increases ship maneuverability and evasion.', 5),
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
