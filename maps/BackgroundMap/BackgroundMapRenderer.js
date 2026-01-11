/**
 * Handles rendering of background bitmap for the BackgroundMap
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
     * Rebuild canvas objects for background bitmap
     */
    rebuildCanvas() {
        const {cvs, backgroundImage} = this.backgroundMap

        // If canvas size changed, recreate background
        if (this.backgroundMap.lastKnownDimensions.width != cvs.canvas.width || this.backgroundMap.lastKnownDimensions.height != cvs.canvas.height) {
            console.log('BackgroundMap: canvas size changed, recreating background.', this.backgroundMap.lastKnownDimensions, {width: cvs.canvas.width, height: cvs.canvas.height})
            this.backgroundMap.lastKnownDimensions.width = cvs.canvas.width
            this.backgroundMap.lastKnownDimensions.height = cvs.canvas.height
        }
        
        // Draw background bitmap - only add if not already present
        const bgId = 'background-starfield'
        let bgObj = cvs.getObject(bgId)
        if (!bgObj) {
            // Calculate size to cover entire canvas
            const canvasSize = Math.max(cvs.canvas.width, cvs.canvas.height) / cvs.pixelRatio
            bgObj = cvs.addBitmap(
                bgId,
                0, 0,
                backgroundImage.src,
                canvasSize*8, // Make it larger to allow for movement
                0,
                null
            )
            bgObj.parallax = true // Enable parallax effect
            bgObj.zIndex = -1000 // Put it behind everything
            console.log('Created background bitmap:', bgId, 'size:', canvasSize * 2)
            
            // Wait for images to load, then redraw
            this.backgroundMap.waitForImagesLoaded([cvs])
        }
    }

    /**
     * Update background bitmap rotation
     */
    refreshBackground(year = 0) {
        const {cvs} = this.backgroundMap
        
        // Slowly rotate the background bitmap
        const bgObj = cvs.getObject('background-starfield')
        if (bgObj) {
            // Very slow rotation
            const time = Date.now() * 0.00002 // Very slow rotation speed
            bgObj.angle = time % (Math.PI * 2) // Clamp to 0-2π range
        }
    }
}
