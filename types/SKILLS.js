/**
 * Represents a skill type that characters can possess
 * @class SkillType
 */
class SkillType {
    /**
     * @param {string} name - The name of the skill
     * @param {number[]} color - RGB color array for the skill
     * @param {string} symbol - Symbol/emoji representing the skill
     * @param {string} description - Description of what the skill does
     */
    constructor(name = '', color = COLORS.White, symbol = '', description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.symbol = symbol
        /** @type {string} */
        this.description = description
    }
}

const SKILLS = {
    Pilot: new SkillType(
        'Pilot',
        COLORS.LightBlue,
        '✈️',
        'Improves fleet maneuverability and travel speed. Higher skill helps avoid hazards and navigate more efficiently.'
    ),
    Stealth: new SkillType(
        'Stealth',
        COLORS.DarkGray,
        '🥷',
        'Reduces detection range and enables sneak attacks. Helps avoid unwanted fleet encounters.'
    ),
    Barter: new SkillType(
        'Barter',
        COLORS.Yellow,
        '💰',
        'Reduces prices when buying and increases profits when selling. Applies to markets, shipyards, and other vendors.'
    ),
    Engineer: new SkillType(
        'Engineer',
        COLORS.Orange,
        '🔧',
        'Repairs hull damage over time and improves module effectiveness. Essential for long journeys.'
    ),
    Salvage: new SkillType(
        'Salvage',
        COLORS.LightGray,
        '⚙️',
        'Increases cargo yield from destroyed asteroids and salvaged encounters. More efficient resource gathering.'
    ),
}

const SKILLS_ALL = Object.values(SKILLS)
