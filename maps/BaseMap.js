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
    initializeDOM(baseZoom, minZoom, maxZoom, cameraPanLimit) {
        this.cvs = new CanvasWrapper(baseZoom, minZoom, maxZoom, cameraPanLimit)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.controls = ce({parent: this.root, style: {position: 'absolute', top: 0, left: 0}})
        this.infoBar = ce({parent: this.root, style:{position:'absolute', bottom: 0, left: 0}})
        this.objectPane = ce({parent: this.root, style: {position: 'absolute', top: 0, right: 0, height: '100%', pointerEvents: 'none'}})
        
        window.addEventListener("resize", ()=>this.cvs.autoResize())
        
        // Deferred initialization for subclasses
        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize()
            this.onDeferredInit()
        }))
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
     * Update background stars (twinkling effect)
     * @param {number} year 
     */
    refreshBackground(year = 0) {
        const {starSystem, cvs} = this
        const {backgroundStars} = starSystem
        backgroundStars.forEach((bgStar, index) => {
            bgStar.twinkle(year)
            cvs.pixels[index].a = bgStar.color[3]
        })
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
}
