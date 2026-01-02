class BackgroundMap extends BaseMap {
    constructor() {
        super()
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(100, 10, 1000, NEPTUNE.orbit.radius)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.outerRadius = 20
        this.innerRadius = 3

        this.bgStars = generateBackgroundStars(this.outerRadius, 500)
        this.starTrails = new Map() // Store trail history externally

        for (const bgStar of this.bgStars) {
            bgStar.reset()
            this.starTrails.set(bgStar, [])
        }

        this.refresh()

        window.addEventListener("resize", ()=>this.cvs.autoResize());

        requestAnimationFrame(()=> requestAnimationFrame(()=>{
            this.cvs.autoResize();
            this.refresh();
        }));

        this.tick()
    }

    refresh() {
        this.rebuildCanvas();
        this.refreshBackground(gs.year)
        this.refreshCanvas(true);
    }

    rebuildCanvas() {
        const {bgStars, cvs, starTrails} = this
        cvs.clear()
        
        // Draw trails first (so they appear behind stars)
        bgStars.forEach((bgStar, starIndex) => {
            const trail = starTrails.get(bgStar)
            if (trail && trail.length > 1) {
                for (let i = 1; i < trail.length; i++) {
                    const curr = trail[i]
                    const prev = trail[i - 1]
                    
                    // Calculate brightness for trail segment based on distance from center
                    const segmentDist = calcDistance(0, 0, curr.x, curr.y)
                    const segmentNormalized = segmentDist / this.outerRadius
                    const segmentBrightness = segmentNormalized * 4
                    
                    const fadeFactor = i / trail.length
                    const trailAlpha = Math.round(255 * fadeFactor * 0.3 * segmentBrightness)
                    const trailColor = [...bgStar.color.slice(0, 3), trailAlpha]
                    cvs.addLine(`trail_${starIndex}_${i}`, prev.x, prev.y, curr.x, curr.y, trailColor, bgStar.radius * 0.5)
                }
            }
        })
        
        // Draw stars
        bgStars.forEach((bgStar, index) => {
            // Calculate brightness multiplier based on distance from center
            const distanceFromCenter = calcDistance(0, 0, bgStar.x, bgStar.y)
            const normalizedDistance = distanceFromCenter / this.outerRadius
            const brightnessFactor = normalizedDistance * 4
            
            cvs.addPixel(bgStar.x, bgStar.y, [bgStar.color[0], bgStar.color[1], bgStar.color[2], Math.round(255 * brightnessFactor)], bgStar.radius*1)
        });
        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs} = this
        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
        const {bgStars, cvs, starTrails} = this
        const trailLength = 5
        
        bgStars.forEach( (bgStar, index) => {
            //bgStar.twinkle(year)

            // Store previous position in trail history
            const trail = starTrails.get(bgStar) || []
            trail.push({x: bgStar.x, y: bgStar.y})
            if (trail.length > trailLength) {
                trail.shift()
            }
            starTrails.set(bgStar, trail)

            bgStar.x *= 1.01
            bgStar.y *= 1.01

            if (calcDistance(0, 0, bgStar.x, bgStar.y) >= this.outerRadius) {
                const distance = rng(this.innerRadius, 0, false)
                const [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
                bgStar.x = x
                bgStar.y = y
                starTrails.set(bgStar, []) // Clear trail on reset
            }
        });
    }

    tick() {
        const currentTime = Date.now()
        this.refreshBackground(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.rebuildCanvas() // Rebuild to update trails
        this.refreshCanvas()

        requestAnimationFrame(()=>this.tick())
    }
}


function showBackgroundMap() {
    const bgMap = new BackgroundMap()
    showMap(bgMap)
}

