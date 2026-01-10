class BackgroundMap extends BaseMap {
    constructor() {
        super()
        this.paused = false // Never pause the background animation
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(`background-map-canvas`, 1, 1, 1, 1)
        this.lastKnownDimensions = {width: this.cvs.canvas.width, height: this.cvs.canvas.height}
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})

        // Use bitmap background instead of generated stars
        this.backgroundImage = BACKGROUNDS.STARFIELD_1

        // Initialize renderer
        this.renderer = new BackgroundMapRenderer(this)

        this.refresh()

        window.addEventListener("resize", ()=>this.cvs.autoResize());

        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize();
            this.refresh()
        }));


        this.tick()
    }

    refresh() {
        this.renderer.rebuildCanvas()
        this.renderer.refreshBackground(gs.year)
        this.refreshCanvas(true)
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs} = this
        cvs.redraw(forceRedraw)
    }

    tick() {
        const currentTime = Date.now()
        this.renderer.refreshBackground(gs.year)
        this.renderer.rebuildCanvas()
        this.refreshCanvas()

        requestAnimationFrame(()=>this.tick())
    }

    // Override togglePause to do nothing - background always animates
    togglePause(newPausedState) {
        // Do nothing - background map never pauses
    }
}


function showBackgroundMap() {
    const bgMap = new BackgroundMap()
    showMap(bgMap)
}

