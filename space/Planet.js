// Planet class extends OrbitingObject
/**
 * @extends {OrbitingObject}
 */
class Planet extends OrbitingObject {
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
        super(name, OBJECT_TYPES.PLANET, color, radius, orbit);
        /** @type {PlanetType} */
        this.planetType = planetType
        /** @type {Settlement|null} */
        this.settlement = settlement
        /** @type {Civilization|null} */
        this.civilization = civilization
        /** @type {null} Climate system removed */
        this.climate = null
        /** @type {PlanetFeatureType[]} */
        this.features = features
        /** @type {number} */
        this.dayLength = dayLength
        /** @type {boolean} */
        this.closed = false
        /** @type {number} - Radius of magnetosphere in AU */
        this.magnetosphereRadius = magnetosphereRadius
        /** @type {string} - Symbol: first letter of planet name in its color */
        this.symbol = colorSpan(this.name.charAt(0), this.color)
        /** @type {Array<PlanetDecorator>} - Visual decorators for this planet */
        this.decorators = []
        
        gameRegistry.registerPlanet(this)
    }
    get c() {
        return this.civilization
    }
    get s() {
        return this.settlement
    }
    
    /**
     * Check if this planet is a valid refueling station for the player
     * @returns {boolean} True if player has visited and there's a working shipyard
     */
    isValidRefuelingStation() {
        // Check if player has visited this planet
        if (!gs.lastVisitedDates.has(this)) return false
        
        // Check memorized settlement for a working shipyard
        const memorizedSettlement = gs.memorizedSettlements.get(this)
        if (!memorizedSettlement) return false
        
        const shipyard = memorizedSettlement.shipyard
        if (!shipyard) return false
        
        // Shipyard must exist and not be damaged
        return shipyard.exists && !shipyard.damaged
    }
    /**
     * Returns a display name based on whether the player has visited this planet
     * @returns {string} - Either the planet name or "Unknown [Type]" descriptor
     */
    get descriptor() {
        const hasVisited = gs.lastVisitedDates.has(this)
        if (hasVisited) {
            return this.name
        }
        // Return generic type-based descriptor if not visited
        if (this instanceof SpaceStation) {
            return 'Unknown Space Station'
        }
        return `Unknown ${this.planetType.name}`
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
    
    /**
     * Add cultural influence from another planet to this planet's civilization.
     * @param {Planet} sourcePlanet - The planet whose culture is being spread
     * @param {number} weight - The influence weight (1.0 = 100% population addition)
     */
    addCulture(sourcePlanet, weight) {
        if (!this.civilization || !this.civilization.cultures || !sourcePlanet) {
            return;
        }
        
        const currentAmt = this.c.cultures.getAmount(sourcePlanet)
        this.c.cultures.setAmount(sourcePlanet, currentAmt * (1 + weight));
        this.c.cultures.normalize();
    }

    /**
     * Add racial influence from another planet to this planet's civilization.
     * @param {Race} sourceRace - The race being spread
     * @param {number} weight - The influence weight (1.0 = 100% population addition)
     */
    addRace(sourceRace, weight) {
        if (!this.civilization || !this.civilization.races || !sourceRace) {
            return;
        }
        
        const currentAmt = this.c.races.getAmount(sourceRace)
        this.c.races.setAmount(sourceRace, currentAmt * (1 + weight));
        this.c.races.normalize();
    }

}
