/**
 * Represents a race type for officers and captains.
 * @class Race
 */
class Race {
    /**
     * @param {string} name - The name of the race.
     * @param {number[]} color - The color associated with this race.
     * @param {string} icon - The icon/emoji for this race.
     * @param {string} description - A description of the race.
     */
    constructor(name = '', color = COLORS.White, icon = '👤', description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.icon = icon
        /** @type {string} */
        this.description = description
    }
}

const RACES = {
    HUMAN: new Race(
        'Human',
        COLORS.Tan,
        '👤',
        'Baseline humanity, unmodified and unaugmented. Versatile and adaptable.'
    ),
    ANDROID: new Race(
        'Android',
        COLORS.LightBlue,
        '🤖',
        'Fully synthetic beings with artificial intelligence. Precise and logical.'
    ),
    CYBORG: new Race(
        'Cyborg',
        COLORS.Silver,
        '⚙️',
        'Humans extensively augmented with cybernetic implants. Enhanced strength and processing.'
    ),
    POSTHUMAN: new Race(
        'Posthuman',
        COLORS.Purple,
        '🧬',
        'Genetically modified humans with enhanced traits. Superior intellect and longevity.'
    ),
}

const RACES_ALL = Object.values(RACES)
