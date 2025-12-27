/**
 * Represents a status effect that can be applied to ships in combat.
 * @class StatusEffect
 */
class StatusEffect {
    /**
     * @param {string} name - The name of the status effect.
     * @param {string} description - A description of what the status effect does.
     * @param {number[]} color - The color associated with this status effect.
     */
    constructor(name = '', description = '', color = COLORS.WHITE) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
    }
}

const STATUS_EFFECTS = Object.freeze({
    DUSTY: new StatusEffect('Dusty', 'Cannot shoot or be shot by lasers, inflicts hull damage over time', COLORS.Brown),
    FROZEN: new StatusEffect('Frozen', 'Reduces movement range and disables ramming', COLORS.LightBlue),
    IONIZED: new StatusEffect('Ionized', 'Inflicts shield damage over time and prevents recharging', COLORS.Yellow),
    OVERHEATED: new StatusEffect('Overheated', 'Inflicts damage over time and blocks use of modules', COLORS.Orange),
    CLOAKED: new StatusEffect('Cloaked', 'Prevents ship from being seen or targeted by enemies', COLORS.Gray),
})

const STATUS_EFFECTS_ALL = Object.values(STATUS_EFFECTS)