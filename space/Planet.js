// Planet class extends OrbitingObject
/**
 * @extends {OrbitingObject}
 */
class Planet extends OrbitingObject {
    /**
     * @param {string} name - The name of the planet.
     * @param {number[]} color - The color of the planet.
     * @param {number} radius - The radius of the planet.
     * @param {number} x - The x-coordinate of the planet.
     * @param {number} y - The y-coordinate of the planet.
     * @param {Orbit} orbit - The orbit of the planet.
     * @param {PlanetType} planetType - The type of the planet.
     * @param {Settlement} settlement - The settlement on the planet.
     * @param {Civilization} civilization - The civilization of the planet.
     * @param {Climate} climate - The climate of the planet.
     * @param {PlanetFeatureType[]} features - Unique features of the planet.
     * @param {PlanetAtmosphereType} atmosphereType - The atmospheric composition.
     * @param {PlanetOceanType} oceanType - The ocean/liquid composition (can be null).
     * @param {PlanetGeologyType} geologyType - The geological composition (can be null for gas giants).
     * @param {number} dayLength - The length of one day in Earth days.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, planetType = PLANET_TYPES_ALL[0], settlement = null, civilization = null, climate = null, features = [], atmosphereType = null, oceanType = null, geologyType = null, dayLength = 1.0) {
        super(name, color, radius, x, y, orbit);
        /** @type {PlanetType} */
        this.planetType = planetType
        /** @type {Settlement} */
        this.settlement = settlement
        /** @type {Civilization} */
        this.civilization = civilization
        /** @type {Climate} */
        this.climate = climate || new Climate()
        /** @type {PlanetFeatureType[]} */
        this.features = features
        /** @type {PlanetAtmosphereType} */
        this.atmosphereType = atmosphereType
        /** @type {PlanetOceanType} */
        this.oceanType = oceanType
        /** @type {PlanetGeologyType} */
        this.geologyType = geologyType
        /** @type {number} */
        this.dayLength = dayLength
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
