/**
 * Represents an object that orbits another object (planet, moon, asteroid, etc.).
 * @class OrbitingObject
 * @extends SpaceObject
 */
class OrbitingObject extends SpaceObject {
    /**
     * @param {string} name - The name of the orbiting object.
     * @param {ObjectType} objectType - The type of object (from OBJECT_TYPES).
     * @param {number[]} color - The color of the object.
     * @param {number} radius - The radius of the object in AU.
     * @param {Orbit} orbit - The orbit definition.
     */
    constructor(name = "Unnamed", objectType = OBJECT_TYPES.ABSTRACT, color = COLORS.White, radius = 0, orbit = null) {
        super(name, objectType, color, radius, 0, 0);
        /** @type {Orbit} */
        this.orbit = orbit;
    }
    /**
     * Calculates the absolute position of this object at a given year,
     * accounting for parent positions if nested (e.g., moon orbiting planet).
     * @param {number} year - The game year to calculate position for.
     * @returns {number[]} Array of [x, y] coordinates in AU.
     */
    calcAbsPositionAtYear(year = 0) {
        if (!this.orbit) return [this.x, this.y]
        let [ox, oy] = this.orbit.calcRelativePosition(year);
        if (this.parent) {
            const [px, py] = this.parent instanceof OrbitingObject ? this.parent.calcAbsPositionAtYear(year) : [this.parent.x, this.parent.y]
            ox += px
            oy += py
        }
        return [ox, oy]
    }
}
