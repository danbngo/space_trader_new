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
     * @param {Culture} culture - The culture of the planet.
     * @param {Climate} climate - The climate of the planet.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, x = 0, y = 0, orbit = null, planetType = PLANET_TYPES_ALL[0], settlement = null, culture = null, climate = null) {
        super(name, color, radius, x, y, orbit);
        /** @type {PlanetType} */
        this.planetType = planetType
        /** @type {Settlement} */
        this.settlement = settlement
        /** @type {Culture} */
        this.culture = culture
        /** @type {Climate} */
        this.climate = climate || new Climate()
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

    get navy() {
        return this.culture.military * this.settlement.shipyard.baseNumShips * this.culture.shipQuality
    }

    get army() {
        return this.culture.military * this.settlement.guild.baseNumOfficers * this.culture.officerQuality
    }

    get militaryPower() {
        return this.navy + this.army
    }
}
