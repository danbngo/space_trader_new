/**
 * Handles rendering of background stars and 3D asteroids for the BackgroundMap
 */
class BackgroundMapRenderer {
    /**
     * @param {BackgroundMap} backgroundMap - Reference to the parent BackgroundMap instance
     */
    constructor(backgroundMap) {
        this.backgroundMap = backgroundMap
        this.cvs = backgroundMap.cvs
    }

    /**
     * Rebuild canvas objects for background stars and asteroids
     */
    rebuildCanvas() {
        const {asteroids, bgStars, cvs, activeAsteroidIds} = this.backgroundMap

        // If canvas size changed, reset background stars
        if (this.backgroundMap.lastKnownDimensions.width != cvs.canvas.width || this.backgroundMap.lastKnownDimensions.height != cvs.canvas.height) {
            console.log('BackgroundMap: canvas size changed, resetting background stars.', this.backgroundMap.lastKnownDimensions, {width: cvs.canvas.width, height: cvs.canvas.height})
            this.backgroundMap.lastKnownDimensions.width = cvs.canvas.width
            this.backgroundMap.lastKnownDimensions.height = cvs.canvas.height
            cvs.pixels = []
        }
        
        // Draw background stars with parallax - only add if not already present
        bgStars.forEach((bgStar, index) => {
            bgStar.twinkle(Date.now() / 500000)
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

    /**
     * Update background star and asteroid positions
     */
    refreshBackground(year = 0) {
        const {asteroids, bgStars, cvs} = this.backgroundMap
        
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
                const moveSpeed = 0.002*(1+0.5*distance) // Pixels per frame
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
            if (asteroid.z < 0.3 || projectedDist > this.backgroundMap.outerRadius) {
                // Reset to new random position at far distance, avoiding center
                const newAngle = Math.random() * Math.PI * 2
                const minDistance = 1.5
                const distance = minDistance + Math.random() * (this.backgroundMap.outerRadius * 0.8 - minDistance)
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
}
