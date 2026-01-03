/**
 * Represents ancient ruins that can be explored for artifacts and technology.
 * @class Ruins
 * @extends OrbitingObject
 */
class Ruins extends OrbitingObject {
    /**
     * @param {string} name - The name of the ruins.
     * @param {RuinsType} ruinsType - The type of ruins.
     * @param {number} radius - The radius of the ruins in AU.
     * @param {Orbit} orbit - The orbital parameters of the ruins.
     */
    constructor(name = "Unknown Ruins", ruinsType = RUINS_TYPES.DEAD_SHIP, radius = 0.15, orbit = null) {
        super(name, OBJECT_TYPES.RUINS, ruinsType.color, radius, orbit)
        /** @type {RuinsType} */
        this.ruinsType = ruinsType;
    }
}
