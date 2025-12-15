class BackgroundMap {
    constructor() {
        this.lastTickMs = Date.now()
        this.gameYearsPerMs = 1/365/24/60 * 2

        this.cvs = new CanvasWrapper(100, 10, 1000, NEPTUNE.orbit.radius*2)
        this.root = createElement({classNames: ['starmap-root'], children: [this.cvs.root]})
        this.outerRadius = 20
        this.innerRadius = 3

        this.bgStars = generateBackgroundStars(this.outerRadius, 5000)

        for (const bgStar of this.bgStars) bgStar.reset()

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
        this.refreshAnimations(gs.year)
        this.refreshCanvas(true);
    }

    rebuildCanvas() {
        const {bgStars, cvs} = this
        cvs.clear()
        bgStars.forEach( (bgStar, index) => {
            cvs.addPixel(bgStar.x, bgStar.y, bgStar.r, bgStar.g, bgStar.b, bgStar.a, bgStar.size)
        });
        cvs.recalculateDrawOrder()
    }

    refreshCanvas(forceRedraw = true) {
        const {cvs} = this
        cvs.redraw(forceRedraw)
    }

    refreshAnimations(year = 0) {
        const {bgStars, cvs} = this
        bgStars.forEach( (bgStar, index) => {
            bgStar.twinkle(year)

            bgStar.x *= 1.01
            bgStar.y *= 1.01

            if (calcDistance(0, 0, bgStar.x, bgStar.y) >= this.outerRadius) {
                bgStar.x = rng(this.innerRadius, 0, false) * (Math.random() > .5 ? 1 : - 1)
                bgStar.y = rng(this.innerRadius, 0, false) * (Math.random() > .5 ? 1 : - 1)
            }

            const pixel = cvs.pixels[index]
            pixel.x = bgStar.x
            pixel.y = bgStar.y
            pixel.a = bgStar.a
        });
    }

    tick() {
        const currentTime = Date.now()
        this.refreshAnimations(currentTime/200000) //hack to make stars twinkle at a reasonable speed
        this.refreshCanvas()

        requestAnimationFrame(()=>this.tick())
    }
}


function showBackgroundMap() {
    const bgMap = new BackgroundMap()
    showMap(bgMap)
}

