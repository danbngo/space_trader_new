/**
 * Represents a religion in the game world.
 * @class Religion
 */
class Religion {
    /**
     * @param {string} name - The name of the religion.
     * @param {ReligionTrait[]} traits - The traits that define this religion's characteristics.
     * @param {number[]} color - The color associated with this religion.
     */
    constructor(name = 'Unnamed Faith', traits = [], color = COLORS.White) {
        /** @type {string} */
        this.name = name;
        /** @type {ReligionTrait[]} */
        this.traits = traits;
        /** @type {number[]} */
        this.color = color;
    }

    /**
     * Checks if this religion has a specific trait.
     * @param {ReligionTrait} trait - The trait to check for.
     * @returns {boolean}
     */
    hasTrait(trait) {
        return this.traits.includes(trait);
    }

    /**
     * Gets a description of this religion including its traits.
     * @returns {string}
     */
    getDescription() {
        if (this.traits.length === 0) {
            return `${this.name} is a faith without notable characteristics.`;
        }
        const traitNames = this.traits.map(t => colorSpan(t.name, t.color)).join(', ');
        return `${colorSpan(this.name, this.color)} - Traits: ${traitNames}`;
    }
}
