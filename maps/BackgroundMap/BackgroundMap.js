class BackgroundMap extends BaseMap {
    constructor() {
        super()
        this.paused = false // Never pause the background animation
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(100, 10, 1000, NEPTUNE.orbit.radius)
        this.lastKnownDimensions = {width: this.cvs.canvas.width, height: this.cvs.canvas.height}
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.outerRadius = 20
        this.innerRadius = 0.1

        // Generate background stars for parallax effect
        this.bgStars = generateBackgroundStars(this.outerRadius * 2, 5000)
        for (const bgStar of this.bgStars) {
            bgStar.reset()
        }

        // Generate 3D asteroids instead of flat stars
        this.asteroids = []
        const numAsteroids = 50
        for (let i = 0; i < numAsteroids; i++) {
            this.asteroids.push(this.createAsteroid())
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

    createAsteroid() {
        // Start at random position across the entire field, avoiding center
        const angle = Math.random() * Math.PI * 2
        const minDistance = 1.5 // Avoid spawning too close to center
        const distance = minDistance + Math.random() * (this.outerRadius * 0.8 - minDistance)
        const z = 2.5 + Math.random() * 2.5 // Random depth from close (2.5) to far (5.0) - spawn farther away
        
        // Brown-ish colors with variation
        const baseR = 160
        const baseG = 120
        const baseB = 80
        
        return {
            uuid: generateUUID(), // Unique ID for tracking
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            z: z, // Depth: high values (far) to low values (close)
            angle: angle, // Direction from center
            rotation: Math.random() * Math.PI * 2, // Current rotation
            rotationSpeed: (Math.random() - 0.5) * 0.05, // Rotation per frame
            vertices: AsteroidShip.generateShape(1.0, 0.4, 0.5),
            color: [
                baseR + rng(40, -40),
                baseG + rng(40, -40),
                baseB + rng(40, -40),
                255
            ]
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

