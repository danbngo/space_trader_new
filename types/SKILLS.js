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
    Gunner: new SkillType(
        'Gunner',
        COLORS.Red,
        '🔫',
        'Improves accuracy and damage with ship weapons. Higher skill increases effectiveness in combat.'
    ),
    Stealth: new SkillType(
        'Stealth',
        COLORS.DarkGray,
        '🥷',
        'Reduces detection range and enables sneak attacks. Helps avoid unwanted fleet encounters. Makes your ships harder to hit.'
    ),
    Negotiation: new SkillType(
        'Negotiation',
        COLORS.LightPurple,
        '🤝',
        'Improves outcomes in diplomatic interactions. Higher skill can unlock better rewards and alliances.'
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
        'Increases cargo yield from destroyed asteroids and abandoned ships and improves chance to find rare items.'
    ),
    Science: new SkillType(
        'Science',
        COLORS.LightGreen,
        '🔬',
        'Detect anomalies from further away, gain more relics when making discoveries, gain more stats when upgrading your ships.'
    ),
}

const SKILLS_ALL = Object.values(SKILLS)
