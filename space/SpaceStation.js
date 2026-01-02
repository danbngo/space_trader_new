// Planet class extends OrbitingObject
/**
 * @extends {OrbitingObject}
 */
class SpaceStation extends OrbitingObject {
    /**
     * @param {string} name - The name of the space station.
     * @param {number[]} color - The color of the space station.
     * @param {number} radius - The radius of the space station.
     * @param {Orbit} orbit - The orbit of the space station.
     * @param {SpaceStationType} spaceStationType - The type of the space station.
     * @param {Settlement|null} settlement - The settlement on the space station.
     * @param {Civilization|null} civilization - The civilization of the space station.
     * @param {Climate} climate - The climate of the space station.
     * @param {PlanetFeatureType[]} features - Unique features of the space station.
     * @param {number} dayLength - The length of one day in Earth days.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, orbit = null, spaceStationType = SPACE_STATION_TYPES_ALL[0], settlement = null, civilization = null, climate = null, features = [], dayLength = 1.0, magnetosphereRadius = 0) {
        super(name, OBJECT_TYPES.SPACE_STATION, color, radius, orbit);
        /** @type {SpaceStationType} */
        this.spaceStationType = spaceStationType
        /** @type {Settlement|null} */
        this.settlement = settlement
        /** @type {Civilization|null} */
        this.civilization = civilization
        /** @type {Climate} */
        this.climate = climate || new Climate()
        /** @type {PlanetFeatureType[]} */
        this.features = features
        /** @type {number} */
        this.dayLength = dayLength
        /** @type {boolean} */
        this.closed = false
        /** @type {number} - Radius of magnetosphere in AU */
        this.magnetosphereRadius = magnetosphereRadius
    }
    get c() {
        return this.civilization
    }
    get s() {
        return this.settlement
    }
}
