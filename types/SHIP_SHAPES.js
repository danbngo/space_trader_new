class BitmapShipShape {
    constructor(src) {
        this.src = src;
    }

    /**
     * Creates a bitmap canvas object from this ship shape
     * @param {CanvasWrapper} canvas - The canvas wrapper
     * @param {Ship} ship - The ship instance (for UUID)
     * @param {Array<number>} color - RGBA color array for tinting [r, g, b, a]
     * @param {number} size - Size to render the bitmap
     * @returns {CanvasObject} The created canvas object
     */
    addCanvasObject(canvas, ship, color, size) {
        console.log('BitmapShipShape.toCanvasObject called with size:', size);
        if (!color || !size) throw new Error('BitmapShipShape.toCanvasObject requires color and size parameters')
        return canvas.addBitmap(`ship-bitmap-${ship.uuid}`, 0, 0, this.src, size, 0, [...color]);
    }
}


const SHIP_SHAPES = {
    COURIER: new BitmapShipShape('images/ship_courier.png'),
}

