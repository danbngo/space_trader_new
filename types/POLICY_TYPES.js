/**
 * Represents a type of policy for a planet's culture.
 * @class PolicyType
 */
class PolicyType {
    /**
     * @param {string} name - The name of the policy type.
     * @param {number[]} color - The color associated with this policy type.
     * @property {PolicyType|null} opposingType - The opposing policy type (if any).
     */
    constructor(name = '', color = COLORS.White) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {PolicyType|null} */
        this.opposingType = null
    }
}

const PT = {
    
}
const PT_ALL = Object.values(GT)

for (const pairing of [
]) {
    pairing[0].opposingType = pairing[1]
    pairing[1].opposingType = pairing[0]
}