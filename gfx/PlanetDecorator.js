/**
 * PlanetDecorator class - Manages visual decorations for planets (craters, rings, clouds, etc.)
 */
class PlanetDecorator {
    /**
     * @param {Object} params
     * @param {Array<{x: number, y: number, radius: number}>} [params.craters] - Array of crater definitions (x,y,radius as ratios 0-1)
     * @property {CanvasWrapper|null} cvs
     */
    constructor({ craters = [] } = {}) {
        /** @type {Array<{x: number, y: number, radius: number}>} */
        this.craters = craters
        
        /** @type {CanvasObject|null} */
        this.parentCanvasObject = null

        /** @type {Array<CanvasObject>} */
        this.canvasObjects = []

        this.cvs = null
    }
    
    /**
     * Associates this decorator with a parent canvas object
     * @param {CanvasWrapper} canvas - The canvas wrapper
     * @param {CanvasObject} canvasObject - The parent planet canvas object
     */
    associate(canvas, canvasObject) {
        this.parentCanvasObject = canvasObject
        this.cvs = canvas
    }
    
    /**
     * Creates canvas objects for all decorations based on parent properties
     * @returns {Array<CanvasObject>} Array of created canvas objects
     */
    decorate() {
        if (!this.parentCanvasObject) {
            console.warn('PlanetDecorator.decorate() called without associated parent canvas object')
            return []
        }
        const parent = this.parentCanvasObject
        const parentZIndex = parent.zIndex || 10
        const parentId = this.parentCanvasObject.id
        
        // Clear existing canvas objects
        this.canvasObjects.forEach(obj => {
            this.cvs.deleteObject(obj.id)
        })
        this.canvasObjects = []
        
        // Create crater canvas objects
        this.craters.forEach((crater, index) => {
            const craterId = `${parentId}-crater-${index}`
            
            // Calculate absolute position and size based on parent
            const craterX = parent.x + (crater.x * parent.size)
            const craterY = parent.y + (crater.y * parent.size)
            const craterRadius = crater.radius * parent.size
            
            // Create a dark filled circle for the crater
            const craterColor = [0, 0, 0, 0.6] // Semi-transparent black
            const craterObj = this.cvs.addFilledCircle(
                craterId,
                craterX,
                craterY,
                craterRadius,
                1, // minScreenSize
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
        const zoom = this.cvs.zoom
        const pixelRatio = this.cvs.pixelRatio
        
        // Check if parent is on-screen - skip update if not visible
        const canvasWidth = this.cvs.canvas.width / pixelRatio
        const canvasHeight = this.cvs.canvas.height / pixelRatio
        const viewWidth = canvasWidth / zoom
        const viewHeight = canvasHeight / zoom
        
        const viewLeft = this.cvs.cameraX - viewWidth / 2
        const viewRight = this.cvs.cameraX + viewWidth / 2
        const viewTop = this.cvs.cameraY - viewHeight / 2
        const viewBottom = this.cvs.cameraY + viewHeight / 2
        
        // Add padding equal to planet size to catch planets partially on screen
        const padding = parent.size * 2
        if (parent.x + padding < viewLeft || parent.x - padding > viewRight ||
            parent.y + padding < viewTop || parent.y - padding > viewBottom) {
            // Planet is off-screen, skip update
            return
        }
        
        // Determine if parent is rendering at minScreenSize or at world-space size
        // The actual rendered size is: Math.max(minScreenSize, size * zoom) / pixelRatio
        const worldSpaceSize = parent.size * zoom
        const isAtMinSize = worldSpaceSize < parent.minScreenSize
        
        // Update crater positions
        this.craters.forEach((crater, index) => {
            const craterObj = this.canvasObjects[index]
            if (!craterObj) return
            
            if (isAtMinSize) {
                // Parent is clamped to minScreenSize - use screen-space offsets
                // Position craters at parent center, then offset in screen space
                craterObj.x = parent.x
                craterObj.y = parent.y
                
                // Calculate screen-space offsets based on minScreenSize
                // Crater positions are ratios (-1 to 1), minScreenSize is in screen pixels before pixelRatio
                craterObj.screenOffsetX = crater.x * parent.minScreenSize
                craterObj.screenOffsetY = crater.y * parent.minScreenSize
                
                // Crater size also needs to be in screen space
                craterObj.size = 0 // Set world size to 0
                craterObj.minScreenSize = crater.radius * parent.minScreenSize
            } else {
                // Parent is rendering at world-space size - use world coordinates
                craterObj.x = parent.x + (crater.x * parent.size)
                craterObj.y = parent.y + (crater.y * parent.size)
                craterObj.size = crater.radius * parent.size
                
                // Clear any screen offsets
                craterObj.screenOffsetX = 0
                craterObj.screenOffsetY = 0
                
                // Set crater minScreenSize proportional to parent
                craterObj.minScreenSize = crater.radius * parent.minScreenSize
            }
        })
        
    }
}
