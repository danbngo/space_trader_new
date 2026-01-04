/**
 * @extends {OrbitingObject}
 * @param {AsteroidBeltType} asteroidBeltType - The type of the asteroid belt.
 * @param {number[]} color - The color of the asteroid belt.
 * @param {number} radius - The radius of the asteroid belt.
 * @property {AsteroidBeltType} asteroidBeltType - The type of the asteroid belt.
 * @property {EncounterType[]} encounterTypes - The types of encounters that can occur in the belt.
 * @property {Orbit} orbit - The orbit of the asteroid belt.
 */
class AsteroidBelt extends OrbitingObject {
    constructor(name = "Unnamed", asteroidBeltType, color = COLORS.White, radius = 0, orbit = null, encounterTypes = [], effectTypes = []) {
        super(name, OBJECT_TYPES.ASTEROID_BELT, color, radius, orbit);
        /** @type {AsteroidBeltType} */
        this.asteroidBeltType = asteroidBeltType
        /** @type {EncounterType[]} */
        this.encounterTypes = encounterTypes
        /** @type {EffectType[]} */
        this.effectTypes = effectTypes
    }
}
