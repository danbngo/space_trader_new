/**
 * @extends {OrbitingObject}
 * @param {ASTEROID_BELT_TYPES} beltType - The type of the asteroid belt.
 * @param {number[]} color - The color of the asteroid belt.
 * @param {number} radius - The radius of the asteroid belt.
 * @property {Orbit} orbit - The orbit of the asteroid belt.
 */
class AsteroidBelt extends OrbitingObject {
    constructor(name = "Unnamed", beltType, color = COLORS.White, radius = 0, orbit = null, encounterTypes = [], effectTypes = []) {
        super(name, OBJECT_TYPES.ASTEROID_BELT, color, radius, orbit);
        this.beltType = beltType
        this.encounterTypes = encounterTypes
        this.effectTypes = effectTypes
    }
}
