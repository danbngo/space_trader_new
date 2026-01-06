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
        this.rebuildCanvas();
        this.refreshBackground(gs.year)
        this.refreshCanvas(true);
    }

    rebuildCanvas() {
        const {asteroids, bgStars, cvs, activeAsteroidIds} = this

        //if last known dims changed refresh bg stars
        if (this.lastKnownDimensions.width != cvs.canvas.width || this.lastKnownDimensions.height != cvs.canvas.height) {
            console.log('BackgroundMap: canvas size changed, resetting background stars.', this.lastKnownDimensions, {width: cvs.canvas.width, height: cvs.canvas.height})
            this.lastKnownDimensions.width = cvs.canvas.width
            this.lastKnownDimensions.height = cvs.canvas.height
            cvs.pixels = []
        }
        
        // Draw background stars with parallax - only add if not already present
        bgStars.forEach((bgStar, index) => {
            bgStar.twinkle(Date.now() / 50000)
            // Only add pixel if it doesn't already exist
            if (cvs.pixels[index] == undefined) {
                // Initialize with random position within screen bounds
                const screenX = Math.random() * cvs.canvas.width / cvs.pixelRatio
                const screenY = Math.random() * cvs.canvas.height / cvs.pixelRatio
                cvs.addPixel(0, 0, bgStar.color, bgStar.radius, screenX, screenY, true)
            } else {
                // Update existing pixel's color for twinkling
                cvs.pixels[index].color = [...bgStar.color]
            }
        })
        
        // Track current asteroid UUIDs
        const currentAsteroidIds = new Set()
        
        // Sort asteroids by z-depth (far to near for proper rendering)
        const sortedAsteroids = [...asteroids].sort((a, b) => b.z - a.z)
        
        // Draw asteroids with 3D projection
        sortedAsteroids.forEach((asteroid) => {
            currentAsteroidIds.add(asteroid.uuid)
            
            // 3D to 2D projection: as z decreases (closer), projected position moves away from center
            const scale = 1 / asteroid.z // Inverse: smaller z = larger scale
            const projectedX = asteroid.x * scale
            const projectedY = asteroid.y * scale
            
            // Size increases as asteroid gets closer (smaller z)
            const baseSize = 0.2
            const size = baseSize * scale
            
            // Brightness increases more dramatically as asteroid gets closer (smaller z)
            // Using squared distance for more pronounced brightness change
            const maxZ = 5.0
            const distanceRatio = (maxZ - asteroid.z) / maxZ // 0 when far, 1 when close
            const brightness = Math.min(1, Math.pow(distanceRatio, 0.5) + 0.3) // Square root for stronger effect, +0.3 min brightness
            const color = [
                Math.round(asteroid.color[0] * brightness),
                Math.round(asteroid.color[1] * brightness),
                Math.round(asteroid.color[2] * brightness),
                Math.round(255 * brightness)
            ]
            
            const asteroidId = `asteroid_${asteroid.uuid}`
            
            // Calculate zIndex: farther asteroids (higher z) get lower zIndex (draw behind)
            // We use inverse of z so closer objects have higher zIndex and draw on top
            const zIndex = Math.round(1000 / asteroid.z)
            
            // Only add if it doesn't exist, otherwise update existing
            const existingObj = cvs.drawOrder.find(obj => obj.id === asteroidId)
            if (!existingObj) {
                cvs.addPolygon(
                    asteroidId,
                    projectedX,
                    projectedY,
                    asteroid.vertices,
                    size,
                    2, // min screen size
                    color,
                    COLORS.White, // white stroke
                    asteroid.rotation,
                    null, // no click handler
                    zIndex // closer asteroids (smaller z) have higher zIndex
                )
                activeAsteroidIds.add(asteroid.uuid)
            } else {
                // Update existing asteroid position, size, brightness, rotation, and zIndex
                existingObj.x = projectedX
                existingObj.y = projectedY
                existingObj.size = size
                existingObj.color = [...color]
                existingObj.rotation = asteroid.rotation
                existingObj.zIndex = zIndex
            }
        })
        
        // Remove canvas objects for asteroids that no longer exist
        const idsToRemove = [...activeAsteroidIds].filter(id => !currentAsteroidIds.has(id))
        for (const uuid of idsToRemove) {
            const asteroidId = `asteroid_${uuid}`
            const index = cvs.drawOrder.findIndex(obj => obj.id === asteroidId)
            if (index !== -1) {
                cvs.drawOrder.splice(index, 1)
            }
            activeAsteroidIds.delete(uuid)
        }
        
        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs} = this
        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
        const {asteroids, bgStars, cvs} = this
        
        // Update background stars - they move slower than asteroids
        const screenWidth = cvs.canvas.width / cvs.pixelRatio
        const screenHeight = cvs.canvas.height / cvs.pixelRatio
        
        bgStars.forEach((bgStar, index) => {
            const pixel = cvs.pixels[index]
            if (!pixel) return
            
            // Slowly move the star outward from center (much slower than asteroid movement)
            const centerX = screenWidth / 2
            const centerY = screenHeight / 2
            const dx = pixel.screenOffsetX - centerX
            const dy = pixel.screenOffsetY - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const xOver0 = distance > 0 ? 1 : -1
            const yOver0 = distance > 0 ? 1 : -1
            
            if (distance > 0) {
                // Move outward along the vector from center
                const moveSpeed = 0.002*(1+0.5*distance)// Pixels per frame (asteroids move at ~0.02 in z-space)
                pixel.screenOffsetX += (dx / distance) * moveSpeed + xOver0 * 0.01
                pixel.screenOffsetY += (dy / distance) * moveSpeed + yOver0 * 0.01
            }
            
            // Check if star is off screen (with some margin)
            const margin = 50
            const isOffScreen = pixel.screenOffsetX < -margin || pixel.screenOffsetX > screenWidth + margin ||
                               pixel.screenOffsetY < -margin || pixel.screenOffsetY > screenHeight + margin
            
            if (isOffScreen) {
                // Reset to random position within screen bounds
                pixel.screenOffsetX = Math.random() * screenWidth
                pixel.screenOffsetY = Math.random() * screenHeight
                bgStar.reset() // Reset twinkle
            }
        })
        
        asteroids.forEach((asteroid, index) => {
            // Move asteroid closer (decrease z)
            asteroid.z -= 0.02
            
            // Rotate asteroid
            asteroid.rotation += asteroid.rotationSpeed
            
            // Calculate projected position to check if off screen
            const scale = 1 / asteroid.z
            const projectedX = asteroid.x * scale
            const projectedY = asteroid.y * scale
            const projectedDist = calcDistance(0, 0, projectedX, projectedY)
            
            // Reset asteroid if it's too close (z < 0.3) or off screen
            if (asteroid.z < 0.3 || projectedDist > this.outerRadius) {
                // Reset to new random position at far distance, avoiding center
                const newAngle = Math.random() * Math.PI * 2
                const minDistance = 1.5
                const distance = minDistance + Math.random() * (this.outerRadius * 0.8 - minDistance)
                asteroid.x = Math.cos(newAngle) * distance
                asteroid.y = Math.sin(newAngle) * distance
                asteroid.z = 3.0 + Math.random() * 2.0 // Reset to far distance (high z)
                asteroid.angle = newAngle
                asteroid.rotation = Math.random() * Math.PI * 2
                asteroid.rotationSpeed = (Math.random() - 0.5) * 0.05
                asteroid.vertices = AsteroidShip.generateShape(1.0, 0.4, 0.5)
                
                // Brown-ish colors with variation
                const baseR = 160
                const baseG = 120
                const baseB = 80
                asteroid.color = [
                    baseR + rng(40, -40),
                    baseG + rng(40, -40),
                    baseB + rng(40, -40),
                    255
                ]
            }
        })
    }

    tick() {
        const currentTime = Date.now()
        this.refreshBackground(currentTime / 200000)
        this.rebuildCanvas()
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

