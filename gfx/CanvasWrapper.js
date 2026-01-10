

class CanvasWrapper {
    constructor(
        id = '',
        zoom = 100,
        minZoom = 10,
        maxZoom = 1000,
        cameraPanLimit = 500,
        dragEnabled = true,
        zoomEnabled = true
    ) {
        // Root element for the user to attach anywhere
        /** @type {HTMLElement} */
        this.root = ce({id, classNames:['canvas-root']})
        /** @type {HTMLCanvasElement} */
        // @ts-ignore
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
        this.dragEnabled = dragEnabled;
        this.zoomEnabled = zoomEnabled;
        
        // Object lists
        this.objectMap = new Map();  // easy lookup by id
        this.drawOrder = [];         // ordered list of objects
        this.hoveredObjects = [];
        this.pixels = []
        
        this.onClickWorldXY = null;
        this.onMouseMoveWorldXY = null;
        this.objClickEnabled = true;
        this.isDragging = false;
        this.dragStartTime = 0;
        this.width = 0
        this.height = 0
        
        // Setup click detection
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        if (dragEnabled) {
            attachDragHandler(this.canvas, (x,y)=>this.onDragMap(x,y))
        }
        if (zoomEnabled) {
            attachMouseWheelHandler(this.canvas, (direction=1)=>{
                this.adjustZoom(direction > 0 ? 1.33 : direction < 0 ? 0.66 : 1.0)
            })
        }
        
        this.pixelRatio = CanvasWrapper.getPixelRatio(this.ctx);
        
        this.maxFrameRate = MAX_FRAMES_PER_SECOND; //do not refresh more than 30 times per second
        this.lastRedrawAt = 0;
        this.fillColor = null
        
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

        this.width = width;
        this.height = height;
        
        this.redraw()
    }
    
    onDragMap(x = 0, y = 0) {
        if (!this.isDragging) {
            this.dragStartTime = Date.now();
        }
        this.isDragging = true;
        this.cameraX -= x/this.zoom
        this.cameraY -= y/this.zoom
        this.cameraX = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraX))
        this.cameraY = Math.min(this.cameraPanLimit, Math.max(-this.cameraPanLimit, this.cameraY))
        this.redraw()
    }
    
    adjustZoom(multiplier = 1) {
        this.zoom *= multiplier;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom))
        console.log('adjusting zoom to', this.zoom, `(multiplier: ${multiplier})`)
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
    
    addFilledOval(id = "", x = 0, y = 0, radiusX = 0, radiusY = 0, minScreenSize = 0, fillColor = COLORS.LightGray, angle = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledOval, x, y, size: radiusX, minorSize: radiusY, minScreenSize, angle, fillColor, onClick });
        return this.addObject(obj)
    }
    
    addFilledRectangle(id = "", x = 0, y = 0, width = 0, height = 0, minScreenSize = 0, fillColor = COLORS.LightGray, angle = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledRectangle, x, y, size: width, minorSize: height, minScreenSize, angle, fillColor, onClick });
        return this.addObject(obj)
    }
    
    addClearCircle(id = "", x = 0, y = 0, radius = 100) {
        const obj = new CanvasObject({ id, shape: SHAPES.ClearCircle, x, y, size: radius});
        obj.zIndex = -1000
        return this.addObject(obj)
    }
    
    addEmptyRectangle(id = "", x = 0, y = 0, width = 0, height = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, lineWidth = 1, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyRectangle, x, y, size: width, minorSize: height, minScreenSize, strokeColor, onClick, lineWidth });
        return this.addObject(obj)
    }
    
    addEmptySquare(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, lineWidth = 1, onClick = null) {
        return this.addEmptyRectangle(id, x, y, size, size, minScreenSize, strokeColor, lineWidth, onClick);
    }
    
    addEmptyCircle(id = "", x = 0, y = 0, size = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, lineWidth = 1, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyCircle, x, y, size, minScreenSize, strokeColor, onClick, lineWidth });
        return this.addObject(obj)
    }
    
    addEmptyOval(id = "", x = 0, y = 0, radiusX = 0, radiusY = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, angle = 0, lineWidth = 1, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyOval, x, y, size: radiusX, minorSize: radiusY, minScreenSize, angle, strokeColor, onClick, lineWidth });
        return this.addObject(obj)
    }
    
    addFilledTriangle(id = "", x = 0, y = 0, size = 0, minorSize = 0, minScreenSize = 0, fillColor = COLORS.LightGray, angle = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledTriangle, x, y, size, minorSize, minScreenSize, fillColor, angle, onClick });
        return this.addObject(obj)
    }
    
    addPolygon(id = "", x = 0, y = 0, vertices = [], size = 1, minScreenSize = 0, fillColor = COLORS.LightGray, strokeColor = null, angle = 0, onClick = null, zIndex = 0) {
        const obj = new CanvasObject({ id, shape: SHAPES.Polygon, x, y, vertices, size, minScreenSize, fillColor, strokeColor, angle, onClick, zIndex });
        return this.addObject(obj)
    }
    
    addBitmap(id = "", x = 0, y = 0, src = null, size = 1, minScreenSize = 0, fillColor = COLORS.White, angle = 0, onClick = null, zIndex = 0) {
        const obj = new CanvasObject({ id, shape: SHAPES.Bitmap, x, y, src, size, minScreenSize, fillColor, angle, onClick, zIndex });
        return this.addObject(obj)
    }
    
    addEmptyTriangle(id = "", x = 0, y = 0, size = 0, minorSize = 0, minScreenSize = 0, strokeColor = COLORS.LightGray, angle = 0, lineWidth = 1, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyTriangle, x, y, size, minorSize, minScreenSize, strokeColor, angle, onClick, lineWidth });
        return this.addObject(obj)
    }
    
    addPixel(x = 0, y = 0, color = COLORS.White, size = 1, screenOffsetX = 0, screenOffsetY = 0, parallax = false) {
        const pixel = new CanvasPixel({x, y, color, size, screenOffsetX, screenOffsetY, parallax})
        this.pixels.push(pixel)
        return pixel
    }
    
    addText(id = "", x = 0, y = 0, screenOffsetX = 0, screenOffsetY = 0, textContent = "", fillColor = COLORS.LightGray, size = DEFAULT_FONT_SIZE, lineWidth = 2, onClick = null, onHover = null, onHoverEnd = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Text, size, lineWidth, x, y, screenOffsetX, screenOffsetY, textContent, fillColor, onClick, onHover, onHoverEnd });
        return this.addObject(obj)
    }
    
    addLine(id = "", x = 0, y = 0, x2 = 0, y2 = 0, strokeColor = COLORS.LightGray, size = 0) {
        const obj = new CanvasObject({
            id,
            shape: SHAPES.Line,
            x, y, x2, y2,
            strokeColor,
            size,
            lineWidth: size,
        });
        return this.addObject(obj)
    }
    
    addObject(obj) {
        this.objectMap.set(obj.id, obj);
        this.drawOrder.push(obj);
        return obj;
    }
    
    /**
     * @param {string | CanvasObject} id 
     * @returns 
     */
    deleteObject(id = "") {
        const obj = this.getObject(id)
        if (!obj) return
        this.objectMap.delete(obj.id)
        this.drawOrder = this.drawOrder.filter(o=>(o !== obj))
    }
    
    /**
     * @param {string | CanvasObject} id 
     * @returns 
     */
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
        else if (obj.shape == SHAPES.Polygon) {
            // Proper point-in-polygon detection
            if (!obj.vertices || !Array.isArray(obj.vertices) || obj.vertices.length < 3) return false;
            
            // Transform mouse coordinates to object's local coordinate system
            const dx = mouseX - ox;
            const dy = mouseY - oy;
            
            // Apply inverse rotation
            const cos = Math.cos(-obj.angle);
            const sin = Math.sin(-obj.angle);
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;
            
            // Scale vertices by size (matching the render logic)
            const size = Math.max(obj.minScreenSize, obj.size * this.zoom)/this.pixelRatio;
            const scaledVertices = obj.vertices.map(([vx, vy]) => [vx * size, vy * size]);
            
            // Create polygon and check containment
            const polygon = new Polygon(scaledVertices);
            if (!polygon.containsPoint(localX, localY)) return false;
        }
        else if (obj.shape == SHAPES.FilledOval || obj.shape == SHAPES.EmptyOval) {
            const ellipse = new Ellipse(ox, oy, Math.max(obj.size * this.zoom, obj.minScreenSize)/this.pixelRatio, Math.max((obj.minorSize || obj.size) * this.zoom, obj.minScreenSize)/this.pixelRatio, obj.angle);
            if (!ellipse.containsPoint(mouseX, mouseY)) return false
        }
        else if (obj.shape == SHAPES.FilledRectangle) {
            const rect = new Rectangle(ox, oy, Math.max(obj.size * this.zoom, obj.minScreenSize)/this.pixelRatio, Math.max((obj.minorSize || obj.size) * this.zoom, obj.minScreenSize)/this.pixelRatio, obj.angle);
            if (!rect.containsPoint(mouseX, mouseY)) return false
        }
        else {
            // basic circular hitbox for all other shapes
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
                //console.log('firing onhover for', obj.id)
                obj.onHover(obj);
                shouldRedraw = true;
            }
        }
        
        // Trigger onHoverEnd for objects no longer hovered
        for (const obj of this.hoveredObjects) {
            if (!currentlyHovered.includes(obj)) {
                //console.log('firing onhoverend for', obj.id)
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
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Don't fire click events if the user dragged for more than 200ms
        if (this.isDragging) {
            const dragDuration = Date.now() - this.dragStartTime;
            this.isDragging = false;
            if (dragDuration > 50) {
                return;
            }
        }
        
        // Check objects by click priority (higher priority first), then reverse draw order
        if (this.objClickEnabled) {
            const clickableObjects = this.drawOrder
                .filter(obj => obj.visible && obj.onClick)
                .sort((a, b) => b.clickPriority - a.clickPriority || this.drawOrder.indexOf(b) - this.drawOrder.indexOf(a));
            
            for (const obj of clickableObjects) {
                if (this.isMouseOverObject(obj, mouseX, mouseY)) {
                    obj.onClick(obj);
                    return
                }
            }
        }
        
        //only fire the default positional handler if no objects clicked and objClickEnabled is true
        if (this.onClickWorldXY) {
            this.onClickWorldXY(...this.screenToWorld(mouseX, mouseY));
            return
        }
        
    }
    
    recalculateDrawOrder() {
        // Sort by zIndex first (higher z = on top), then by shape type as fallback
        const sorted = [...this.drawOrder].sort((a, b) => {
            // Primary sort: by zIndex (lower values draw first/behind)
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            // Secondary sort: by shape type for objects with same zIndex
            const order = { Line: 0, EmptyCircle: 1, EmptyOval: 2, EmptyRectangle: 3, EmptyTriangle: 4, FilledRectangle: 5, FilledCircle: 6, FilledOval: 7, Triangle: 8, Polygon: 9, Text: 10 };
            return (order[a.shape] || 0) - (order[b.shape] || 0);
        });
        this.drawOrder = sorted
    }

    /**
     * Check if a line segment intersects or is within a rectangle (viewport)
     * @param {number} x1 - Line start x
     * @param {number} y1 - Line start y
     * @param {number} x2 - Line end x
     * @param {number} y2 - Line end y
     * @param {number} rectX - Rectangle left
     * @param {number} rectY - Rectangle top
     * @param {number} rectWidth - Rectangle width
     * @param {number} rectHeight - Rectangle height
     * @returns {boolean}
     */
    isLineIntersectingRect(x1, y1, x2, y2, rectX, rectY, rectWidth, rectHeight) {
        // Check if either endpoint is inside the rectangle
        if ((x1 >= rectX && x1 <= rectX + rectWidth && y1 >= rectY && y1 <= rectY + rectHeight) ||
            (x2 >= rectX && x2 <= rectX + rectWidth && y2 >= rectY && y2 <= rectY + rectHeight)) {
            return true;
        }
        
        // Check intersection with each edge of the rectangle
        const rectRight = rectX + rectWidth;
        const rectBottom = rectY + rectHeight;
        
        // Helper to check if line segments intersect
        const lineSegmentIntersect = (ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) => {
            const denominator = ((bx2 - bx1) * (ay2 - ay1)) - ((by2 - by1) * (ax2 - ax1));
            if (denominator === 0) return false; // Parallel lines
            
            const ua = (((by2 - by1) * (ax1 - bx1)) - ((bx2 - bx1) * (ay1 - by1))) / denominator;
            const ub = (((ay2 - ay1) * (ax1 - bx1)) - ((ax2 - ax1) * (ay1 - by1))) / denominator;
            
            return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
        };
        
        // Check intersection with all four edges of the rectangle
        return lineSegmentIntersect(x1, y1, x2, y2, rectX, rectY, rectRight, rectY) ||           // Top edge
               lineSegmentIntersect(x1, y1, x2, y2, rectRight, rectY, rectRight, rectBottom) ||   // Right edge
               lineSegmentIntersect(x1, y1, x2, y2, rectX, rectBottom, rectRight, rectBottom) ||  // Bottom edge
               lineSegmentIntersect(x1, y1, x2, y2, rectX, rectY, rectX, rectBottom);             // Left edge
    }

    removeExpiredObjects() {
        const expiredIds = this.drawOrder.filter(o=>o.expired).map(o=>o.id)
        for (const id of expiredIds) {
            this.deleteObject(id)
        }
    }
    
    redraw(forceRedraw = false) {
        this.removeExpiredObjects()

        const now = Date.now()
        const msSinceLastRedraw = now - this.lastRedrawAt
        if (msSinceLastRedraw < 1000/this.maxFrameRate && !forceRedraw) {
            return
        }
        this.lastRedrawAt = now
        
        const {ctx, canvas, pixels, zoom, pixelRatio} = this
        const {width, height} = canvas
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.clearRect(0, 0, width/pixelRatio, height/pixelRatio);
        // Always clear canvas first
        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
            ctx.fillRect(0, 0, width/pixelRatio, height/pixelRatio);
            console.log('filling canvas with color', this.fillColor, width, height, pixelRatio);
        }

        // Draw pixels (asteroids, etc)
        if (this.pixels.length > 0) {
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
                if (!pixel.visible) continue;
                let sx = 0//pixel.offsetY;
                let sy = 0//pixel.offsetY;
                if (!pixel.parallax) [sx, sy] = this.worldToScreen(pixel.x, pixel.y);
                sx += pixel.screenOffsetX;
                sy += pixel.screenOffsetY;
                sx = Math.round(sx*pixelRatio)
                sy = Math.round(sy*pixelRatio)
                if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
                const size = pixel.size;
                const intSize = Math.ceil(size)
                for (let offsetX = -intSize; offsetX <= intSize; offsetX++) {
                    for (let offsetY = -intSize; offsetY <= intSize; offsetY++) {
                        if (sx + offsetX < 0 || sx + offsetX >= width || sy + offsetY < 0 || sy + offsetY >= height) continue;
                        if (calcDistance(0, 0, offsetX, offsetY) > size) continue;
                        putPixelAt(sx + offsetX, sy + offsetY, pixel.color[0], pixel.color[1], pixel.color[2], pixel.color[3])
                    }
                }
            }
            ctx.putImageData(pixelImgData, 0, 0);
        }
        
        const drawOrder = this.drawOrder
        for (const obj of drawOrder) {
            if (!obj.visible) continue
            let [sx, sy] = this.worldToScreen(obj.x, obj.y);
            sx += obj.screenOffsetX;
            sy += obj.screenOffsetY;
            const size = Math.max(obj.minScreenSize, obj.size * zoom / pixelRatio)
            
            // Special visibility check for lines
            if (obj.shape === SHAPES.Line && obj.x2 !== undefined && obj.y2 !== undefined) {
                const [sx2, sy2] = this.worldToScreen(obj.x2, obj.y2);
                // Check if line intersects with or is within the viewport
                if (!this.isLineIntersectingRect(sx, sy, sx2, sy2, 0, 0, width/pixelRatio, height/pixelRatio)) continue;
            } else {
                // Standard visibility check for other shapes
                if (sx + size < 0 || sx - size >= width/pixelRatio || sy + size < 0 || sy - size >= height/pixelRatio) continue;
            }
            
            // Don't round coordinates at very low zoom to preserve relative positioning
            // Rounding only helps performance at higher zooms where sub-pixel precision doesn't matter
            if (zoom > 5) {
                sx = Math.round(sx)
                sy = Math.round(sy)
            }
            
            let x2Offset = 0;
            let y2Offset = 0;
            if (obj.x2 !== undefined && obj.y2 !== undefined) {
                const [sx2, sy2] = this.worldToScreen(obj.x2, obj.y2);
                x2Offset = sx2 - sx
                y2Offset = sy2 - sy
            }
            
            obj.draw(now, ctx, size, sx, sy, x2Offset, y2Offset)
        }
    }
}
