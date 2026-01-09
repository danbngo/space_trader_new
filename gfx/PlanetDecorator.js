/**
 * PlanetDecorator class - Manages visual decorations for planets (craters, rings, clouds, etc.)
 */
class PlanetDecorator {
    /**
     * @param {Object} params
     * @param {Array<{x: number, y: number, radius: number}>} [params.craters] - Array of crater definitions (x,y,radius as ratios 0-1)
     */
    constructor({ craters = [] } = {}) {
        /** @type {Array<{x: number, y: number, radius: number}>} */
        this.craters = craters
        
        /** @type {CanvasObject|null} */
        this.parentCanvasObject = null
        
        /** @type {number} */
        this.lastParentX = 0
        
        /** @type {number} */
        this.lastParentY = 0
        
        /** @type {Array<CanvasObject>} */
        this.canvasObjects = []
    }
    
    /**
     * Associates this decorator with a parent canvas object
     * @param {CanvasObject} canvasObject - The parent planet canvas object
     */
    associate(canvasObject) {
        this.parentCanvasObject = canvasObject
        this.lastParentX = canvasObject.x
        this.lastParentY = canvasObject.y
    }
    
    /**
     * Creates canvas objects for all decorations based on parent properties
     * @param {CanvasWrapper} cvs - The canvas wrapper to add objects to
     * @param {string} parentId - The parent planet's ID for unique naming
     * @returns {Array<CanvasObject>} Array of created canvas objects
     */
    decorate(cvs, parentId) {
        if (!this.parentCanvasObject) {
            console.warn('PlanetDecorator.decorate() called without associated parent canvas object')
            return []
        }
        
        const parent = this.parentCanvasObject
        const parentZIndex = parent.zIndex || 10
        
        // Store cvs reference for update() method
        this.cvs = cvs
        
        // Clear existing canvas objects
        this.canvasObjects.forEach(obj => {
            cvs.deleteObject(obj.id)
        })
        this.canvasObjects = []
        
        // Create crater canvas objects
        this.craters.forEach((crater, index) => {
            const craterId = `${parentId}-crater-${index}`
            
            // Calculate position in world space
            const craterX = parent.x + (crater.x * parent.size)
            const craterY = parent.y + (crater.y * parent.size)
            const craterRadius = crater.radius * parent.size
            
            // Calculate minScreenSize proportional to parent's minScreenSize
            // This ensures craters scale with parent when it hits minScreenSize
            const craterMinScreenSize = parent.minScreenSize * crater.radius
            
            // Create a dark filled circle for the crater
            const craterColor = [0, 0, 0, 0.6] // Semi-transparent black
            const craterObj = cvs.addFilledCircle(
                craterId,
                craterX,
                craterY,
                craterRadius,
                craterMinScreenSize,
                craterColor,
                null // no click handler
            )
            
            // Set higher z-index to draw on top of planet
            craterObj.zIndex = parentZIndex + 1
            craterObj.clickPriority = -1 // Don't intercept clicks
            
            this.canvasObjects.push(craterObj)
        })
        
        return this.canvasObjects
    }
    
    /**
     * Updates decorator positions based on parent movement
     */
    update() {
        if (!this.parentCanvasObject || !this.cvs) {
            return
        }
        
        const parent = this.parentCanvasObject
        
        // Update crater positions using parent's world-space size
        // CanvasWrapper will handle zoom scaling via: Math.max(minScreenSize, size * zoom / pixelRatio)
        this.craters.forEach((crater, index) => {
            const craterObj = this.canvasObjects[index]
            if (craterObj) {
                // Use parent.size (world-space) for positioning - zoom is applied by CanvasWrapper
                craterObj.x = parent.x + (crater.x * parent.size)
                craterObj.y = parent.y + (crater.y * parent.size)
                craterObj.size = crater.radius * parent.size
            }
        })
        
        // Update last known position
        this.lastParentX = parent.x
        this.lastParentY = parent.y
    }
}
