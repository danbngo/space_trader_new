/**
 * Represents an asteroid that orbits within an asteroid belt.
 * @class Asteroid
 * @extends OrbitingObject
 */
class Asteroid extends OrbitingObject {
    /**
     * @param {string} name - The name of the asteroid.
     * @param {number[]} color - The color of the asteroid.
     * @param {number} radius - The radius of the asteroid in AU.
     * @param {Orbit} orbit - The orbit of the asteroid.
     * @param {AsteroidBelt} belt - The asteroid belt this asteroid belongs to.
     */
    constructor(name = "Unnamed", color = COLORS.Gray, radius = 0, orbit = null, belt = new AsteroidBelt()) {
        super(name, OBJECT_TYPES.ASTEROID, color, radius, orbit);
        /** @type {AsteroidBelt} */
        this.belt = belt
    }
}
