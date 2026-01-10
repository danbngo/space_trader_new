/**
 * CombatLog - manages combat message logging
 */
class CombatLog {
    constructor() {
        /** @type {string[]} */
        this.messages = []
    }

    /**
     * Adds a message to the combat log
     * @param {string} message
     */
    add(message) {
        this.messages.push(message)
    }

    /**
     * Gets all messages
     * @returns {string[]}
     */
    getAll() {
        return this.messages
    }

    /**
     * Clears all messages
     */
    clear() {
        this.messages = []
    }

    /**
     * Gets the latest message
     * @returns {string|null}
     */
    getLatest() {
        return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null
    }
}
