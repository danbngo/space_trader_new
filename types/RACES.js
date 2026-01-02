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
     */
    constructor(name = '', color = COLORS.White, symbol = '👤', description = '', weight = 1) {
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
    }
}

const RACES = {
    HUMAN: new Race(
        'Human',
        COLORS.LightMagenta,
        '👤',
        'Baseline humanity, unmodified and unaugmented. Versatile and adaptable.',
        2 // 2x more common than other races
    ),
    ANDROID: new Race(
        'Android',
        COLORS.LightBlue,
        '🤖',
        'Fully synthetic beings with artificial intelligence. Precise and logical.',
        1
    ),
    CYBORG: new Race(
        'Cyborg',
        COLORS.Gray,
        '⚙️',
        'Humans extensively augmented with cybernetic implants. Enhanced strength and processing.',
        1
    ),
    POSTHUMAN: new Race(
        'Posthuman',
        COLORS.Green,
        '🧬',
        'Genetically modified humans with enhanced traits. Superior intellect and longevity.',
        1
    ),
}

const RACES_ALL = Object.values(RACES)
