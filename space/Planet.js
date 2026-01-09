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
     * Renders the planet to a canvas element using CanvasWrapper
     * @param {number} size - The size of the canvas in pixels
     * @returns {HTMLElement} - Container element with the rendered planet canvas
     */
    asCanvas(size = 80) {
        // Create a container element to set bounds
        const container = ce({
            style: {
                width: `${size}px`,
                height: `${size}px`,
                display: 'inline-block',
                position: 'relative'
            }
        })
        
        // Create a CanvasWrapper to properly render the planet
        const cvs = new CanvasWrapper(1, 1, 1, 0)
        cvs.canvas.style.display = 'block'
        cvs.canvas.style.position = 'absolute'
        cvs.canvas.style.top = '0'
        cvs.canvas.style.left = '0'
        setTimeout(() => {
            cvs.autoResize()
            cvs.canvas.style.left = `${(container.clientWidth - cvs.canvas.width)/2}px`
            cvs.canvas.style.top = `${(container.clientHeight - cvs.canvas.height)/2}px`
        }, 1)

        // Append canvas to container
        container.appendChild(cvs.root)
        
        // Position camera at center
        cvs.cameraX = 0
        cvs.cameraY = 0
        cvs.zoom = 0 // Scale so planet radius of 1 fills half the canvas
        
        // Add the planet as a filled circle at origin
        const planetObj = cvs.addFilledCircle(
            `planet-${this.uuid}-canvas`,
            0, // x at origin
            0, // y at origin
            0, // radius (will be scaled by zoom)
            size/3, // min screen size
            this.color,
            null // no click handler
        )
        
        // Add decorators using the decorate method
        if (this.decorators && this.decorators.length > 0) {
            this.decorators.forEach(decorator => {
                decorator.associate(this, planetObj)
                decorator.decorate(cvs, `planet-${this.uuid}-canvas`)
            })
        }
        
        // Auto-resize canvas to fit container
        cvs.autoResize()
        
        // Render the canvas
        cvs.redraw(true)
        
        // Return the container element
        return container
    }
}
