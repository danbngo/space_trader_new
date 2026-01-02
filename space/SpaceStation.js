// Planet class extends OrbitingObject
/**
 * @extends {OrbitingObject}
 */
class SpaceStation extends OrbitingObject {
    /**
     * @param {string} name - The name of the space station.
     * @param {number[]} color - The color of the space station.
     * @param {number} radius - The radius of the space station.
     * @param {number} x - The x-coordinate of the space station.
     * @param {number} y - The y-coordinate of the space station.
     * @param {Orbit} orbit - The orbit of the space station.
     * @param {PlanetType} space stationType - The type of the space station.
     * @param {Settlement|null} settlement - The settlement on the space station.
     * @param {Civilization|null} civilization - The civilization of the space station.
     * @param {Climate} climate - The climate of the space station.
     * @param {PlanetFeatureType[]} features - Unique features of the space station.
     * @param {number} dayLength - The length of one day in Earth days.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, space stationType = PLANET_TYPES_ALL[0], settlement = null, civilization = null, climate = null, features = [], dayLength = 1.0, magnetosphereRadius = 0) {
        super(name, color, radius, x, y, orbit);
        /** @type {PlanetType} */
        this.space stationType = space stationType
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
    get ianName() {
        let baseName = this.name+'ian'
        if (baseName.endsWith('yian')) baseName = baseName.replace('yian', 'ian') //mercury
        //venus already handled
        if (baseName == 'Earthian') baseName = 'Terran' //earth
        if (baseName.endsWith('upiterian')) baseName = baseName.replace('upiterian', 'ovian') //jupiter
        //saturn already handled
        if (baseName.endsWith('nusian')) baseName = baseName.replace('nusian', 'nian') //uranus
        //neptune covered by vowel cases below
        if (baseName.endsWith('aian')) baseName = baseName.replace('aian', 'ian')
        if (baseName.endsWith('eian')) baseName = baseName.replace('eian', 'ian')
        if (baseName.endsWith('iian')) baseName = baseName.replace('iian', 'ian')
        if (baseName.endsWith('oian')) baseName = baseName.replace('oian', 'ian')
        if (baseName.endsWith('uian')) baseName = baseName.replace('uian', 'ian')
        if (baseName.endsWith('sian')) baseName = baseName.replace('sian', 'tian') //mars
        return baseName
    }

}
