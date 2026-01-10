/**
 * Base class for map implementations (StarMap, EncounterMap)
 * Provides common canvas, UI, and control patterns
 */
class BaseMap {
    constructor() {
        /** @type {StarSystem} */
        this.starSystem = null
        
        /** @type {any} */
        this.selectedObject = null
        
        /** @type {boolean} */
        this.paused = true
        
        /** @type {number} */
        this.lastTickMs = Date.now()
        
        /** @type {number} */
        this.maxMsPerTick = 100
        
        /** @type {CanvasWrapper} */
        this.cvs = null
        
        /** @type {HTMLElement} */
        this.root = null
        
        /** @type {HTMLElement} */
        this.controls = null
        
        /** @type {HTMLElement} */
        this.infoBar = null
        
        /** @type {HTMLElement} */
        this.objectPane = null
    }
    
    /**
     * Initialize the map's DOM structure
     * @param {number} baseZoom 
     * @param {number} minZoom 
     * @param {number} maxZoom 
     * @param {number} cameraPanLimit 
     */
    initializeDOM(id, baseZoom, minZoom, maxZoom, cameraPanLimit) {
        /*this.cvs = new CanvasWrapper(id, baseZoom, minZoom, maxZoom, cameraPanLimit)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})
        
        window.addEventListener("resize", ()=>this.cvs.autoResize())
        
        // Deferred initialization for subclasses
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize()
            this.onDeferredInit()
        }))*/
    }
    
    /**
     * Override in subclass for deferred initialization after DOM is ready
     */
    onDeferredInit() {
        // Override in subclass
    }
    
    /**
     * Main refresh - calls all sub-refresh methods
     */
    refresh() {
        this.refreshControls()
        this.refreshInfoBar()
        this.refreshObjectPane()
        this.refreshCanvas(true)
    }
    
    /**
     * Override in subclass to rebuild control buttons
     */
    refreshControls() {
        // Override in subclass
    }
    
    /**
     * Override in subclass to update info bar
     */
    refreshInfoBar() {
        // Override in subclass
    }
    
    /**
     * Override in subclass to rebuild canvas objects
     */
    rebuildCanvas() {
        // Override in subclass
    }
    
    /**
     * Override in subclass to update canvas object positions/state
     * @param {boolean} forceRedraw 
     */
    refreshCanvas(forceRedraw = false) {
        // Override in subclass
    }
    
    /**
     * Override in subclass to update object details pane
     */
    refreshObjectPane() {
        // Override in subclass
    }
    
    /**
     * Select an object on the map
     * @param {any} obj 
     */
    selectObject(obj) {
        console.log('selected:', obj)
        this.selectedObject = obj
        this.cvs.moveCameraTo(obj.x, obj.y)
        this.refresh()
    }
    
    /**
     * Toggle pause state
     * @param {boolean} newPausedState 
     */
    togglePause(newPausedState = !this.paused) {
        console.log('setting paused to:', newPausedState)
        this.paused = newPausedState
        if (!this.paused) {
            this.lastTickMs = Date.now()
            this.tick()
        }
        this.refresh()
    }
    
    /**
     * Override in subclass for game loop logic
     */
    tick() {
        // Override in subclass
    }
    
    /**
     * Wait for all images in the given canvases to load, then redraw them
     * @param {CanvasWrapper[]} canvases - Array of CanvasWrapper instances to check
     */
    waitForImagesLoaded(canvases) {
        const checkInterval = 50 // ms
        
        const checkAndRedraw = () => {
            let allLoaded = true
            
            for (const canvas of canvases) {
                for (const obj of canvas.drawOrder) {
                    // Check if object has an image that's still loading
                    if (obj.imageLoaded === false) {
                        allLoaded = false
                        break
                    }
                }
                if (!allLoaded) break
            }
            
            if (allLoaded) {
                // All images loaded (or no images present), redraw all canvases
                for (const canvas of canvases) {
                    canvas.redraw(true)
                }
                console.log('✨ All images loaded, canvases redrawn')
            } else {
                // Keep checking
                setTimeout(checkAndRedraw, checkInterval)
            }
        }
        
        // Start checking
        checkAndRedraw()
    }
}
