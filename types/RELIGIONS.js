
/**
 * Represents a religion in the game world.
 * @class Religion
 */
class Religion {
    /**
     * @param {string} name - The name of the religion.
     * @param {ReligionTrait[]} traits - The traits that define this religion's characteristics.
     * @param {number[]} color - The color associated with this religion.
     * @param {string} symbol - The symbol/symbol representing this religion.
     */
    constructor(name = 'Unnamed Faith', traits = [], color = COLORS.White, symbol = '✦') {
        /** @type {string} */
        this.uuid = generateUUID('religion_')
        /** @type {string} */
        this.name = name;
        /** @type {ReligionTrait[]} */
        this.traits = traits;
        /** @type {number[]} */
        this.color = color;
        /** @type {string} */
        this.symbol = symbol;
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


const RELIGION_ATHEISM = new Religion(
    'Atheism',
    [RELIGION_TRAITS.MATERIALIST, RELIGION_TRAITS.RATIONALIST],
    COLORS.Gray,
    '∅'
);

const RELIGION_AGNOSTICISM = new Religion(
    'Agnosticism',
    [RELIGION_TRAITS.TOLERANT, RELIGION_TRAITS.RATIONALIST],
    COLORS.LightGray,
    '?'
);