class CanvasObject {
    constructor({
        id = '',
        shape = SHAPES.FilledCircle,
        x = 0,
        y = 0,
        size = 1,        // for triangle
        rotation = 0,    // radians for triangle
        fillColor = '#ccc',
        strokeColor = null,
        textContent = null,
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
        filters = new Map()
    } = {}) {
        this.id = id;
        this.shape = shape;

        this.x = x;
        this.y = y;
        this.size = size;
        this.size = size;
        this.rotation = rotation;

        this.fillColor = fillColor;
        this.strokeColor = strokeColor;

        this.textContent = textContent;
        this.onClick = onClick;
        this.onHover = onHover;
        this.onHoverEnd = onHoverEnd;

        this.x2 = x2;
        this.y2 = y2;
        this.lineWidth = lineWidth;

        this.screenOffsetX = screenOffsetX;
        this.screenOffsetY = screenOffsetY;
        this.minScreenSize = minScreenSize;
        this.visible = visible

        this.filters = filters
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
        this.root = createElement({classNames:['canvas-root']})
        this.canvas = createElement({parent:this.root, tag:'canvas'})

        this.ctx = this.canvas.getContext('2d');
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = "source-over";
        
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

        // Setup click detection
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        attachDragHandler(this.canvas, (x,y)=>this.onDragMap(x,y), 5)
        attachMouseWheelHandler(this.canvas, (direction=1)=>{
            this.adjustZoom(direction > 0 ? 1.33 : direction < 0 ? 0.66 : 1.0)
        })

        this.pixelRatio = CanvasWrapper.getPixelRatio(this.ctx);
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
        const pixelRatio = this.pixelRatio//CanvasWrapper.getPixelRatio(this.ctx);
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

        // (Optional) redraw your scene here
        this.redraw()
    }

    // ----------------------
    // Camera + Zoom Controls
    // ----------------------

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

    addFilledCircle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, fillColor = '#ccc', onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledCircle, x, y, size, minScreenSize, fillColor, onClick });
        return this.addObject(obj)
    }

    addEmptyCircle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, strokeColor = '#ccc', onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyCircle, x, y, size, minScreenSize, strokeColor, onClick });
        return this.addObject(obj)
    }

    addTriangle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, fillColor = '#ccc', rotation = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Triangle, x, y, size, minScreenSize, fillColor, rotation, onClick });
        return this.addObject(obj)
    }

    addPixel(x = 0, y = 0, r = 255, g = 255, b = 255, a = 255, size = 1) {
        const pixel = new CanvasPixel({x, y, r, g, b, a, size})
        this.pixels.push(pixel)
        return pixel
    }

    addText(id = "", x = 0, y = 0, screenOffsetX = 0, screenOffsetY = 0, textContent = "", fillColor = '#ccc', size = 0, onClick = null, onHover = null, onHoverEnd = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Text, size, x, y, screenOffsetX, screenOffsetY, textContent, fillColor, onClick, onHover, onHoverEnd });
        return this.addObject(obj)
    }

    addLine(id = "", x = 0, y = 0, x2 = 0, y2 = 0, strokeColor = '#ccc', lineWidth = 0) {
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
        return this.objectMap.get(id) || null;
    }

    clear() {
        this.objectMap.clear()
        this.drawOrder = []
        this.pixels = []
    }

    // ----------------------
    // Internal Helpers
    // ----------------------

    worldToScreen(x = 0, y = 0) {
        return {
            sx: ((x - this.cameraX) * this.zoom + (this.canvas.width / 2)) / this.pixelRatio,
            sy: ((y - this.cameraY) * this.zoom + (this.canvas.height / 2)) / this.pixelRatio
        };
    }

    isMouseOverObject(obj, mouseX = 0, mouseY = 0) {
        let { sx: ox, sy: oy } = this.worldToScreen(obj.x, obj.y);
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
            const hitRadius = Math.max(obj.minScreenSize, obj.size * this.zoom)
            if (dist > hitRadius) return false
        }
        return true
    }

    handleHover(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

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
            const order = { dot: 0, filledCircle: 1, emptyCircle: 1, triangle: 2, text: 3 };
            return order[a.shape] - order[b.shape];
        });
        this.drawOrder = sorted
    }

    // ----------------------
    // Drawing
    // ----------------------

    redraw() {
        const {ctx, canvas, pixels, zoom, pixelRatio} = this
        const {width, height} = canvas
        ctx.clearRect(0, 0, width, height);
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
            let { sx, sy } = this.worldToScreen(pixel.x, pixel.y);
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
            let { sx, sy } = this.worldToScreen(obj.x, obj.y);

            let x2Offset = 0;
            let y2Offset = 0;
            if (obj.x2 !== undefined && obj.y2 !== undefined) {
                const { sx: sx2, sy: sy2 } = this.worldToScreen(obj.x2, obj.y2)
                x2Offset = sx2 - sx
                y2Offset = sy2 - sy
            }

            sx += obj.screenOffsetX;
            sy += obj.screenOffsetY;

            sx = Math.round(sx)
            sy = Math.round(sy)

            ctx.save();
            ctx.translate(sx, sy);

            ctx.fillStyle = obj.fillColor;
            ctx.strokeStyle = obj.strokeColor;
            const filterKeys = [...obj.filters.keys()]
            if (filterKeys.length > 0) {
                ctx.filter = filterKeys.map(k=>`${k}(${obj.filters.get(k)})`).join(' ');
            }
            ctx.lineWidth = obj.lineWidth;
            const size = Math.max(obj.minScreenSize, obj.size * zoom / pixelRatio)
            if (obj.rotation) ctx.rotate(obj.rotation + Math.PI/2);

            switch (obj.shape) {
                case SHAPES.FilledCircle:
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.fill();
                    if (obj.strokeColor) ctx.stroke()
                    break;

                case SHAPES.EmptyCircle:
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.stroke();
                    break;

                case SHAPES.Triangle:
                    const r = size;
                    const h = (Math.sqrt(3) / 2) * r;
                    ctx.beginPath();
                    ctx.moveTo(0, -h / 2);
                    ctx.lineTo(-r / 2, h / 2);
                    ctx.lineTo(r / 2, h / 2);
                    ctx.closePath();
                    ctx.fill();
                    if (obj.strokeColor) ctx.stroke()
                    break;

                case SHAPES.Text:
                    ctx.font = `${obj.size}px "Google Sans Code"`;
                    ctx.strokeStyle = obj.strokeColor || "black";
                    ctx.strokeText(obj.textContent, 0, 0);
                    ctx.fillText(obj.textContent, 0, 0);
                    break;

                case SHAPES.Line:
                    ctx.beginPath();
                    ctx.moveTo(0, 0); // start point
                    ctx.lineTo(x2Offset, y2Offset); // end point
                    ctx.stroke();       // actually draw it
            }

            ctx.restore();
        }
    }
}
