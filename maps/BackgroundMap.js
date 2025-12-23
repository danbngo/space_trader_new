class BackgroundMap extends BaseMap {
    constructor() {
        super()
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(100, 10, 1000, NEPTUNE.orbit.radius*2)
        this.root = ce({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.outerRadius = 20
        this.innerRadius = 3

        this.bgStars = generateBackgroundStars(this.outerRadius, 5000)

        for (const bgStar of this.bgStars) {
            bgStar.reset()
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
        const {bgStars, cvs} = this
        cvs.clear()
        bgStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x, bgStar.y, bgStar.color, bgStar.radius)
        });
        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs} = this
        cvs.redraw(forceRedraw)
    }

    refreshBackground(year = 0) {
        const {bgStars, cvs} = this
        bgStars.forEach( (bgStar, index) => {
            bgStar.twinkle(year)

            bgStar.x *= 1.01
            bgStar.y *= 1.01

            if (calcDistance(0, 0, bgStar.x, bgStar.y) >= this.outerRadius) {
                const distance = rng(this.innerRadius, 0, false)
                const [x,y] = rotatePoint(distance, 0, 0, 0, Math.PI*4*Math.random())
                bgStar.x = x
                bgStar.y = y
            }

            const pixel = cvs.pixels[index]
            pixel.x = bgStar.x
            pixel.y = bgStar.y
            pixel.a = bgStar.color[3]
        });
    }

    tick() {
        const currentTime = Date.now()
        this.refreshBackground(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.refreshCanvas()

        requestAnimationFrame(()=>this.tick())
    }
}


function showBackgroundMap() {
    const bgMap = new BackgroundMap()
    showMap(bgMap)
}

