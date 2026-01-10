class BackgroundMap extends BaseMap {
    constructor() {
        super()
        this.paused = false // Never pause the background animation
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(`background-map-canvas`, 100, 10, 1000, NEPTUNE.orbit.radius)
        this.lastKnownDimensions = {width: this.cvs.canvas.width, height: this.cvs.canvas.height}
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.outerRadius = 20
        this.innerRadius = 0.1

        // Generate background stars for parallax effect
        this.bgStars = generateBackgroundStars(this.outerRadius * 2, 1000)

        // Generate 3D asteroids instead of flat stars
        this.asteroids = []
        const numAsteroids = 50
        for (let i = 0; i < numAsteroids; i++) {
            this.asteroids.push(this.createAsteroid(true)) // Pass true for initial random z
        }

        // Track which asteroid UUIDs are currently on canvas
        this.activeAsteroidIds = new Set()

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

    createAsteroid(isInitial = false) {
        // Start at random position across the entire field, avoiding center
        const angle = Math.random() * Math.PI * 2
        const minDistance = 1.5 // Avoid spawning too close to center
        const distance = minDistance + Math.random() * (this.outerRadius * 0.8 - minDistance)
        // On initial load, spawn at random depths; after that, spawn at max distance
        const z = isInitial ? (0.3 + Math.random() * 7.7) : 8.0
        
        // Brown-ish colors with variation
        const baseR = 160
        const baseG = 120
        const baseB = 80
        const baseR2 = 120
        const baseG2 = 120
        const baseB2 = 120
        
        return {
            uuid: generateUUID(), // Unique ID for tracking
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            z: z, // Depth: high values (far) to low values (close)
            angle: angle, // Direction from center
            rotation: Math.random() * Math.PI * 2, // Current rotation
            rotationSpeed: (Math.random() - 0.5) * 0.05, // Rotation per frame
            vertices: generateAsteroidShape(1.0, 0.4, 0.5),
            color: Math.random() > 0.5 ? [
                baseR + rng(3, -3),
                baseG + rng(3, -3),
                baseB + rng(3, -3),
                255
            ] : [
                baseR2 + rng(3, -3),
                baseG2 + rng(3, -3),
                baseB2 + rng(3, -3),
                255
            ],
            radius: rng(1,0.1,false)
        }
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

