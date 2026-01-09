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
     * @param {PlanetFeatureType[]} features - Unique features of the planet.
     * @param {number} dayLength - The length of one day in Earth days.
     */
    constructor(name = "Unnamed", color = COLORS.White, radius = 0, orbit = null, planetType = PLANET_TYPES_ALL[0], settlement = null,
        civilization = null, features = [], dayLength = 1.0) {
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
     * Renders the planet to a canvas element
     * @param {number} size - The size of the canvas in pixels
     * @returns {HTMLCanvasElement} - Canvas element with the rendered planet
     */
    asCanvas(size = 80) {
        // Create a canvas element
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        
        // Draw the planet as a filled circle
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.color[3] / 255})`
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw decorators if they exist
        if (this.decorators && this.decorators.length > 0) {
            this.decorators.forEach(decorator => {
                if (decorator.canvasObjects && decorator.canvasObjects.length > 0) {
                    decorator.canvasObjects.forEach(obj => {
                        // Simple rendering of craters as dark circles
                        if (obj.shape === SHAPES.FilledCircle) {
                            const relX = (obj.x / this.radius) * (size / 2) + size / 2
                            const relY = (obj.y / this.radius) * (size / 2) + size / 2
                            const relRadius = (obj.size / this.radius) * (size / 2)
                            
                            ctx.fillStyle = `rgba(${obj.fillColor[0]}, ${obj.fillColor[1]}, ${obj.fillColor[2]}, ${obj.fillColor[3] / 255})`
                            ctx.beginPath()
                            ctx.arc(relX, relY, relRadius, 0, Math.PI * 2)
                            ctx.fill()
                        }
                    })
                }
            })
        }
        
        return canvas
    }
}
