/**
 * Represents a race type for officers and captains.
 * @class Race
 */
class Race {
    /**
     * @param {string} name - The name of the race.
     * @param {number[]} color - The color associated with this race.
     * @param {string} symbol - The symbol/emoji for this race.
     * @param {string} description - A description of the race.
     * @param {number} weight - The selection weight for this race (higher = more common).
     * @param {PerkType[]} automaticPerks - Perks this race automatically gains on levelup if they meet the level threshold.
     */
    constructor(name = '', color = COLORS.White, symbol = '👤', description = '', weight = 1, automaticPerks = []) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.symbol = symbol
        /** @type {string} */
        this.description = description
        /** @type {number} */
        this.weight = weight
        /** @type {PerkType[]} */
        this.automaticPerks = automaticPerks
    }
}

const RACES = {
    HUMAN: new Race(
        'Human',
        COLORS.LightMagenta,
        '👤',
        'Baseline humanity, unmodified and unaugmented. Versatile and adaptable.',
        2, // 2x more common than other races
        [PERK_TYPES.SKILLED_1, PERK_TYPES.SKILLED_2, PERK_TYPES.SKILLED_3, PERK_TYPES.SKILLED_4, PERK_TYPES.SKILLED_5]
    ),
    ANDROID: new Race(
        'Android',
        COLORS.LightBlue,
        '🤖',
        'Fully synthetic beings with artificial intelligence. Precise and logical.',
        1,
        [] // TBD
    ),
    CYBORG: new Race(
        'Cyborg',
        COLORS.Gray,
        '⚙️',
        'Humans extensively augmented with cybernetic implants. Enhanced strength and processing.',
        1,
        [PERK_TYPES.CYBER_SOLDIER_1, PERK_TYPES.CYBER_SOLDIER_2, PERK_TYPES.CYBER_SOLDIER_3, PERK_TYPES.CYBER_SOLDIER_4, PERK_TYPES.CYBER_SOLDIER_5,
         PERK_TYPES.CYBER_CAPACITY_1, PERK_TYPES.CYBER_CAPACITY_2, PERK_TYPES.CYBER_CAPACITY_3, PERK_TYPES.CYBER_CAPACITY_4, PERK_TYPES.CYBER_CAPACITY_5]
    ),
    POSTHUMAN: new Race(
        'Posthuman',
        COLORS.DarkCyan,
        '🧬',
        'Genetically modified humans with enhanced traits. Superior intellect and longevity.',
        1,
        [PERK_TYPES.GENE_SOLDIER_1, PERK_TYPES.GENE_SOLDIER_2, PERK_TYPES.GENE_SOLDIER_3, PERK_TYPES.GENE_SOLDIER_4, PERK_TYPES.GENE_SOLDIER_5,
         PERK_TYPES.MUTATION_1, PERK_TYPES.MUTATION_2, PERK_TYPES.MUTATION_3, PERK_TYPES.MUTATION_4, PERK_TYPES.MUTATION_5]
    ),
}

const RACES_ALL = Object.values(RACES)
