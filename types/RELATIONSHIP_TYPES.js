/**
 * Represents a type of diplomatic relationship between planets.
 * @class RelationshipType
 */
class RelationshipType {
    /**
     * @param {string} name - The name of the relationship type.
     * @param {number[]} color - The color associated with this relationship type.
     */
    constructor(name = '', color = COLORS.White) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
    }
}



const RELATIONSHIP_TYPES = Object.freeze({
    ALLY: new RelationshipType('Ally', COLORS.LightGreen),
    NEUTRAL: new RelationshipType('Neutral', COLORS.LightGray),
    HOSTILE: new RelationshipType('Hostile', COLORS.Yellow),
    WAR: new RelationshipType('War', COLORS.Red),
    SOVEREIGN: new RelationshipType('Sovereign', COLORS.LightPurple),
    SUBJECT: new RelationshipType('Subject', COLORS.DimGray),
})
const RELATIONSHIP_TYPES_ALL = Object.freeze(Object.values(RELATIONSHIP_TYPES))

