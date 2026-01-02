// Planet class extends OrbitingObject
/**
 * @extends {Planet}
 */
class DwarfPlanet extends Planet {
    /**
     * @param {string} name - The name of the planet.
     * @param {number[]} color - The color of the planet.
     * @param {number} radius - The radius of the planet.
     * @param {Orbit} orbit - The orbit of the planet.
     * @param {PlanetType} planetType - The type of the planet.
     * @param {Settlement|null} settlement - The settlement on the planet.
     * @param {Civilization|null} civilization - The civilization of the planet.
     * @param {Climate} climate - The climate of the planet.
     * @param {PlanetFeatureType[]} features - Unique features of the planet.
     * @param {number} dayLength - The length of one day in Earth days.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, orbit = null, planetType = PLANET_TYPES_ALL[0], settlement = null, civilization = null, climate = null, features = [], dayLength = 1.0, magnetosphereRadius = 0) {
        super(name, color, radius, orbit, planetType, settlement, civilization, climate, features, dayLength, magnetosphereRadius);
        this.objectType = OBJECT_TYPES.DWARF_PLANET;
    }
}
