class CanvasObject {
    constructor({
        id = '',
        shape = SHAPES.FilledCircle,
        x = 0,
        y = 0,
        size = 1,        // for triangle
        minorSize = 1,   // for oval
        rotation = 0,    // radians for triangle
        fillColor = COLORS.White,
        strokeColor = null,
        textContent = null,
        fontModifier = null,
        onClick = null,
        onHover = null,
        onHoverEnd = null,
        //for lines
        x2 = 0,
        y2 = 0,
        lineWidth = 1,
        screenOffsetX = 0,
        screenOffsetY = 0,
        minScreenSize = 1,
        visible = true,
        gradient = false
    } = {}) {
        this.id = id;
        this.shape = shape;
        this.gradient = gradient;

        this.x = x;
        this.y = y;
        this.size = size;
        this.size = size;
        this.minorSize = minorSize;
        this.rotation = rotation;

        this.fillColor = fillColor ? [...fillColor] : null;
        this.strokeColor = strokeColor ? [...strokeColor] : null;

        this.textContent = textContent;
        this.onClick = onClick;
        this.onHover = onHover;
        this.onHoverEnd = onHoverEnd;
        this.fontModifier = fontModifier;

        this.x2 = x2;
        this.y2 = y2;
        this.lineWidth = lineWidth;

        this.screenOffsetX = screenOffsetX;
        this.screenOffsetY = screenOffsetY;
        this.minScreenSize = minScreenSize;
        this.visible = visible
    }

    draw(ctx, size = 1, sx = 0, sy = 0, x2Offset = 0, y2Offset = 0, overrideStrokeColor = undefined) {
        ctx.save();
        ctx.translate(sx, sy);

        ctx.fillStyle = colorArrToRgbaString(this.fillColor);
        const effectiveStrokeColor = overrideStrokeColor !== undefined ? overrideStrokeColor : this.strokeColor
        ctx.strokeStyle = effectiveStrokeColor ? colorArrToRgbaString(effectiveStrokeColor) : null;
        ctx.lineWidth = this.lineWidth;
        let minorSize = this.size ? size*(this.minorSize / this.size) : size;

        switch (this.shape) {
            case SHAPES.FilledCircle:
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.fill();
                if (this.strokeColor) ctx.stroke()
                break;

            case SHAPES.FilledOval:
                //minorSize is the y radius, size is the x radius
                ctx.beginPath();
                console.log('drawing ellipse w rotation:',this.rotation)
                ctx.ellipse(0, 0, size, minorSize, this.rotation, 0, Math.PI * 2);
                ctx.fill();
                if (this.strokeColor) ctx.stroke()
                //if (this.rotation) ctx.rotate(this.rotation);
                break;

            case SHAPES.EmptyCircle:
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case SHAPES.Triangle:
                if (this.rotation) ctx.rotate(this.rotation);
                /*if (this.gradient) {
                    const gradient = ctx.createLinearGradient(0, 0, 0, size)
                    gradient.addColorStop(1, '#000000');
                    gradient.addColorStop(0, ctx.fillStyle); 
                    ctx.fillStyle = gradient;
                }*/
                ctx.beginPath();
                // tip (pointing right)
                ctx.moveTo(minorSize / 2, 0);
                // base top
                ctx.lineTo(-minorSize / 2, -size / 2);
                // base bottom
                ctx.lineTo(-minorSize / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                if (this.strokeColor) ctx.stroke()
                break;

            case SHAPES.Text:
                ctx.font = `${this.size}px "Google Sans Code"`;
                if (this.fontModifier) {
                    ctx.font = `${this.fontModifier} ${this.size}px "Google Sans Code"`;
                }

                ctx.strokeStyle = ctx.strokeStyle || "black";
                ctx.strokeText(this.textContent, 0, 0);
                ctx.fillText(this.textContent, 0, 0);
                break;

            case SHAPES.Line:
                ctx.beginPath();
                ctx.moveTo(0, 0); // start point
                ctx.lineTo(x2Offset, y2Offset); // end point
                ctx.stroke();       // actually draw it
        }

        ctx.restore();
    }

    asImage(size = 0, strokeColor = undefined) {
        console.log('drawing canvasobj as image:',size,strokeColor,this)
        const diameter = size*2
        const c = document.createElement("canvas");
        c.width = c.height = diameter;
        const ctx = c.getContext("2d");

        this.draw(ctx, size, size, size, 0, 0, strokeColor)

        return c;
    }

}

class CanvasPixel {
    constructor({x = 0, y = 0, r = 255, g = 255, b = 255, a = 255, size = 1} = {}) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.size = size;
    }
}


class CanvasWrapper {
    constructor(
        zoom = 100,
        minZoom = 10,
        maxZoom = 1000,
        cameraPanLimit = 500,
    ) {
        // Root element for the user to attach anywhere
        this.root = ce({classNames:['canvas-root']})
        this.canvas = ce({parent:this.root, tag:'canvas'})

        this.ctx = this.canvas.getContext('2d');
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.imageSmoothingEnabled = false;

        // Camera + zoom
        this.cameraX = 0;
        this.cameraY = 0;
        this.zoom = zoom;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.cameraPanLimit = cameraPanLimit;

        // Object lists
        this.objectMap = new Map();  // easy lookup by id
        this.drawOrder = [];         // ordered list of objects
        this.hoveredObjects = [];
        this.pixels = []

        this.onClickWorldXY = null;
        this.onMouseMoveWorldXY = null;

        // Setup click detection
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        attachDragHandler(this.canvas, (x,y)=>this.onDragMap(x,y), 5)
        attachMouseWheelHandler(this.canvas, (direction=1)=>{
            this.adjustZoom(direction > 0 ? 1.33 : direction < 0 ? 0.66 : 1.0)
        })

        this.pixelRatio = CanvasWrapper.getPixelRatio(this.ctx);

        this.maxFrameRate = 60; //do not refresh more than 30 times per second
        this.lastRedrawAt = 0;

        this.autoResize()
    }

    static getPixelRatio(ctx) {
        const dpr = window.devicePixelRatio || 1;
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }

    autoResize() {
        const pixelRatio = this.pixelRatio
        console.log('pixelRatio:', pixelRatio);
        const styleWidth = this.root.clientWidth - 16;
        const styleHeight = this.root.clientHeight - 8;
        const width = styleWidth * pixelRatio;
        const height = styleHeight * pixelRatio;

        this.canvas.style.width = `${styleWidth}px`;
        this.canvas.style.height = `${styleHeight}px`;
        this.canvas.width = width
        this.canvas.height = height
        this.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        this.redraw()
    }

    onDragMap(x = 0, y = 0) {
        this.cameraX -= x/this.zoom
        this.cameraY -= y/this.zoom
        this.cameraX = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraX))
        this.cameraY = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraY))
        this.redraw()
    }

    adjustZoom(multiplier = 1) {
        this.zoom *= multiplier;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom))
        this.redraw();
    }

    moveCameraTo(x = 0, y = 0) {
        this.cameraX = x;
        this.cameraY = y;
        this.redraw();
    }

    // ----------------------
    // Object Creation Helpers
    // ----------------------

    addFilledCircle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, fillColor = COLORS.LightGray, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledCircle, x, y, size, minScreenSize, fillColor, onClick });
        return this.addObject(obj)
    }

    addFilledOval(id = "", x = 0, y = 0, radiusX = 0, radiusY = 0, minScreenSize = 0, fillColor = COLORS.LightGray, rotation = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledOval, x, y, size: radiusX, minorSize: radiusY, minScreenSize, rotation, fillColor, onClick });
        return this.addObject(obj)
    }

    addEmptyCircle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, lineWidth = 1, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyCircle, x, y, size, minScreenSize, strokeColor, onClick, lineWidth });
        return this.addObject(obj)
    }

    addTriangle(id = "", x = 0, y = 0, size = 0, minorSize = 0, minScreenSize = 0, fillColor = COLORS.LightGray, rotation = 0, onClick = null, gradient = false) {
        console.log('adding cvs triangle with size, minorSize:',size,minorSize)
        const obj = new CanvasObject({ id, shape: SHAPES.Triangle, x, y, size, minorSize, minScreenSize, fillColor, rotation, onClick, gradient });
        return this.addObject(obj)
    }

    addPixel(x = 0, y = 0, r = 255, g = 255, b = 255, a = 255, size = 1) {
        const pixel = new CanvasPixel({x, y, r, g, b, a, size})
        this.pixels.push(pixel)
        return pixel
    }

    addText(id = "", x = 0, y = 0, screenOffsetX = 0, screenOffsetY = 0, textContent = "", fillColor = COLORS.LightGray, size = 0, lineWidth = 2, onClick = null, onHover = null, onHoverEnd = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Text, size, lineWidth, x, y, screenOffsetX, screenOffsetY, textContent, fillColor, onClick, onHover, onHoverEnd });
        return this.addObject(obj)
    }

    addLine(id = "", x = 0, y = 0, x2 = 0, y2 = 0, strokeColor = COLORS.LightGray, lineWidth = 0) {
        const obj = new CanvasObject({
            id,
            shape: SHAPES.Line,
            x, y, x2, y2,
            strokeColor,
            lineWidth,
        });
        return this.addObject(obj)
    }

    addObject(obj) {
        this.objectMap.set(obj.id, obj);
        this.drawOrder.push(obj);
        return obj;
    }

    deleteObject(id = "") {
        const obj = this.getObject(id)
        if (!obj) return
        this.objectMap.delete(obj.id)
        this.drawOrder = this.drawOrder.filter(o=>(o !== obj))
    }

    getObject(id = "") {
        if (id instanceof CanvasObject) return id
        return this.objectMap.get(id) || null;
    }

    clear() {
        this.objectMap.clear()
        this.drawOrder = []
        this.pixels = []
    }

    worldToScreen(x = 0, y = 0) {
        return [
            ((x - this.cameraX) * this.zoom + (this.canvas.width / 2)) / this.pixelRatio,
            ((y - this.cameraY) * this.zoom + (this.canvas.height / 2)) / this.pixelRatio
        ];
    }

    screenToWorld(sx = 0, sy = 0) {
        return [
            ((sx * this.pixelRatio) - (this.canvas.width / 2)) / this.zoom + this.cameraX,
            ((sy * this.pixelRatio) - (this.canvas.height / 2)) / this.zoom + this.cameraY
        ];
    }

    isMouseOverObject(obj, mouseX = 0, mouseY = 0) {
        let [ox, oy] = this.worldToScreen(obj.x, obj.y);
        ox += obj.screenOffsetX;
        oy += obj.screenOffsetY;
        if (obj.shape == SHAPES.Text) {
            const numLetters = obj.textContent.length
            const textWidth = numLetters * obj.size
            const textHeight = obj.size
            if (!isPointInRect(mouseX, mouseY, ox-textWidth/2, oy-textHeight/2, textWidth, textHeight)) return false
        }
        else {
            // basic circular hitbox for all shapes for now
            const dist = Math.hypot(ox - mouseX, oy - mouseY);
            const hitRadius = Math.max(obj.minScreenSize, obj.size * this.zoom)/this.pixelRatio
            if (dist > hitRadius) return false
        }
        return true
    }

    handleHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.onMouseMoveWorldXY) {
            this.onMouseMoveWorldXY(...this.screenToWorld(mouseX, mouseY));
        }

        const currentlyHovered = [];
        let shouldRedraw = false;

        // Check each object in draw order (or reverse if you want top-most priority)
        for (let i = this.drawOrder.length - 1; i >= 0; i--) {
            const obj = this.drawOrder[i];
            if (!obj.visible) continue;
            if (!obj.onHover) continue;
            if (!this.isMouseOverObject(obj, mouseX, mouseY)) continue;
            currentlyHovered.push(obj);
        }

        // Trigger onHover for newly hovered objects
        for (const obj of currentlyHovered) {
            if (!this.hoveredObjects.includes(obj)) {
                console.log('firing onhover for', obj.id)
                obj.onHover(obj);
                shouldRedraw = true;
            }
        }

        // Trigger onHoverEnd for objects no longer hovered
        for (const obj of this.hoveredObjects) {
            if (!currentlyHovered.includes(obj)) {
                console.log('firing onhoverend for', obj.id)
                obj.onHoverEnd?.(obj);
                shouldRedraw = true;
            }
        }

        // Update hoveredObjects list
        this.hoveredObjects = currentlyHovered;
        if (shouldRedraw) this.redraw();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.onClickWorldXY) {
            this.onClickWorldXY(...this.screenToWorld(mouseX, mouseY));
            return
        }

        // Check objects in reverse draw order (top-most first)
        for (let i = this.drawOrder.length - 1; i >= 0; i--) {
            const obj = this.drawOrder[i];
            if (!obj.visible) continue;
            if (!obj.onClick) continue;
            if (this.isMouseOverObject(obj, mouseX, mouseY)) {
                obj.onClick(obj);
                return
            }
        }
    }

    recalculateDrawOrder() {
        // Sort so dots at bottom, text at top
        const sorted = [...this.drawOrder].sort((a, b) => {
            const order = { Line: 0, EmptyCircle: 1, FilledCircle: 2, FilledOval: 3, Triangle: 4, Text: 5 };
            return order[a.shape] - order[b.shape];
        });
        this.drawOrder = sorted
    }

    redraw(forceRedraw = false) {
        const now = Date.now()
        const msSinceLastRedraw = now - this.lastRedrawAt
        if (msSinceLastRedraw < 1000/this.maxFrameRate && !forceRedraw) {
            return
        }
        this.lastRedrawAt = now

        const {ctx, canvas, pixels, zoom, pixelRatio} = this
        const {width, height} = canvas
        //ctx.clearRect(0, 0, width, height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const pixelImgData = ctx.createImageData(width, height);
        const pixelData = pixelImgData.data;

        function putPixelAt(sx, sy, r, g, b, a) {
            const i = (sy * width + sx) * 4;
            pixelData[i] = r
            pixelData[i + 1] = g
            pixelData[i + 2] = b
            pixelData[i + 3] = a
        }

        for (const pixel of pixels) {
            let [sx, sy] = this.worldToScreen(pixel.x, pixel.y);
            sx = Math.round(sx*pixelRatio)
            sy = Math.round(sy*pixelRatio) 
            if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
            const size = pixel.size;
            const intSize = Math.ceil(size)
            for (let offsetX = -intSize; offsetX <= intSize; offsetX++) {
                for (let offsetY = -intSize; offsetY <= intSize; offsetY++) {
                    if (sx + offsetX < 0 || sx + offsetX >= width || sy + offsetY < 0 || sy + offsetY >= height) continue;
                    if (calcDistance(0, 0, offsetX, offsetY) > size) continue;
                    putPixelAt(sx + offsetX, sy + offsetY, pixel.r, pixel.g, pixel.b, pixel.a)
                }
            }
            //putPixelAt(sx, sy, pixel.r, pixel.g, pixel.b, pixel.a)
        }

        ctx.putImageData(pixelImgData, 0, 0);

        const drawOrder = this.drawOrder
        for (const obj of drawOrder) {
            if (!obj.visible) continue
            let [sx, sy] = this.worldToScreen(obj.x, obj.y);
            sx += obj.screenOffsetX;
            sy += obj.screenOffsetY;
            const size = Math.max(obj.minScreenSize, obj.size * zoom / pixelRatio)

            if (sx + size < 0 || sx - size >= width || sy + size < 0 || sy - size >= height) continue;
            sx = Math.round(sx)
            sy = Math.round(sy)

            let x2Offset = 0;
            let y2Offset = 0;
            if (obj.x2 !== undefined && obj.y2 !== undefined) {
                const [sx2, sy2] = this.worldToScreen(obj.x2, obj.y2);
                x2Offset = sx2 - sx
                y2Offset = sy2 - sy
            }

            obj.draw(ctx, size, sx, sy, x2Offset, y2Offset)
        }
    }
}
