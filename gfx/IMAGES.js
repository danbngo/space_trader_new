class ImageHandler {
    constructor(src) {
        this.src = src;
    }

    /**
     * Creates a bitmap canvas object from this ship shape
     * @param {string} id - Unique identifier for the canvas object
     * @param {CanvasWrapper} canvas - The canvas wrapper
     * @param {Array<number>} color - RGBA color array for tinting [r, g, b, a]
     * @param {number} size - Size to render the bitmap
     * @param {boolean} mirror - Whether to flip the bitmap horizontally
     * @returns {CanvasObject} The created canvas object
     */
    addCanvasObject(id, canvas, color, size, mirror = false) {
        console.log('ImageHandler.toCanvasObject called with size:', size, 'mirror:', mirror);
        if (!color || !size) throw new Error('ImageHandler.toCanvasObject requires color and size parameters')
        const obj = canvas.addBitmap(id, 0, 0, this.src, size, 0, [...color]);
        obj.mirror = mirror; // Store mirror flag on the object
        return obj;
    }
}


const SHIP_SHAPES = {
    COURIER: new ImageHandler('images/ship_courier.png'),
}

const BACKGROUNDS = {
    STARFIELD_1: new ImageHandler('images/bg_space.png'),
}

