class CanvasObject {
    constructor({
        id = '',
        shape = SHAPES.Dot,   // SHAPES.Dot | SHAPES.FilledCircle | SHAPES.EmptyCircle | SHAPES.Triangle | SHAPES.Text
        x = 0,
        y = 0,
        size = 1,        // for triangle
        rotation = 0,    // radians for triangle
        color = '#fff',
        textContent = '',
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
        filter = null
    } = {}) {
        this.id = id;
        this.shape = shape;

        this.x = x;
        this.y = y;
        this.size = size;
        this.size = size;
        this.rotation = rotation;

        this.color = color;

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

        this.filter = filter
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

        // Setup click detection
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        attachDragHandler(this.canvas, (x,y)=>this.onDragMap(x,y), 5)
        attachMouseWheelHandler(this.canvas, (direction=1)=>{
            this.adjustZoom(direction > 0 ? 1.33 : direction < 0 ? 0.66 : 1.0)
        })

        this.autoResize()
    }

    autoResize() {
        // Get container size in pixels
        const width = this.root.clientWidth - 16;
        const height = this.root.clientHeight - 8;

        // Update the canvas *pixel buffer*
        this.canvas.width = width;
        this.canvas.height = height;

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

    moveCameraTo(x, y) {
        this.cameraX = x;
        this.cameraY = y;
        this.redraw();
    }

    // ----------------------
    // Object Creation Helpers
    // ----------------------

    addFilledCircle(id, x, y, size, minScreenSize, color, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.FilledCircle, x, y, size, minScreenSize, color, onClick });
        return this.addObject(obj)
    }

    addEmptyCircle(id, x, y, size, minScreenSize, color, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.EmptyCircle, x, y, size, minScreenSize, color, onClick });
        return this.addObject(obj)
    }

    addTriangle(id, x, y, size, minScreenSize, color, rotation = 0, onClick = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Triangle, x, y, size, minScreenSize, color, rotation, onClick });
        return this.addObject(obj)
    }

    addDot(id, x, y, color) {
        const obj = new CanvasObject({ id, shape: SHAPES.Dot, x, y, size: 1, color });
        return this.addObject(obj)
    }

    addText(id, x, y, screenOffsetX = 0, screenOffsetY = 0, textContent, color, size = DEFAULT_FONT_SIZE, onClick = null, onHover = null, onHoverEnd = null) {
        const obj = new CanvasObject({ id, shape: SHAPES.Text, size, x, y, screenOffsetX, screenOffsetY, textContent, color, onClick, onHover, onHoverEnd });
        return this.addObject(obj)
    }

    addLine(id, x, y, x2, y2, color, lineWidth = 1) {
        const obj = new CanvasObject({
            id,
            shape: SHAPES.Line,
            x, y, x2, y2,
            color,
            lineWidth,
        });
        return this.addObject(obj)
    }

    addObject(obj) {
        this.objectMap.set(obj.id, obj);
        this.drawOrder.push(obj);
        return obj;
    }

    deleteObject(id) {
        const obj = this.getObject(id)
        if (!obj) return
        this.objectMap.delete(obj.id)
        this.drawOrder = this.drawOrder.filter(o=>(o !== obj))
    }

    getObject(id) {
        return this.objectMap.get(id) || null;
    }

    clearObjects() {
        this.objectMap.clear()
        this.drawOrder = []
    }

    // ----------------------
    // Internal Helpers
    // ----------------------

    worldToScreen(x, y) {
        return {
            sx: (x - this.cameraX) * this.zoom + this.canvas.width / 2,
            sy: (y - this.cameraY) * this.zoom + this.canvas.height / 2
        };
    }

    isMouseOverObject(obj, mouseX, mouseY) {
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

        // Check each object in draw order (or reverse if you want top-most priority)
        for (let i = this.drawOrder.length - 1; i >= 0; i--) {
            const obj = this.drawOrder[i];
            if (!obj.onHover) continue;
            if (!this.isMouseOverObject(obj, mouseX, mouseY)) continue;
            currentlyHovered.push(obj);
        }

        // Trigger onHover for newly hovered objects
        for (const obj of currentlyHovered) {
            if (!this.hoveredObjects.includes(obj)) {
                obj.onHover(obj);
            }
        }

        // Trigger onHoverEnd for objects no longer hovered
        for (const obj of this.hoveredObjects) {
            if (!currentlyHovered.includes(obj)) {
                obj.onHoverEnd?.(obj);
            }
        }

        // Update hoveredObjects list
        this.hoveredObjects = currentlyHovered;
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check objects in reverse draw order (top-most first)
        for (let i = this.drawOrder.length - 1; i >= 0; i--) {
            const obj = this.drawOrder[i];
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
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const drawOrder = this.drawOrder
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

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

            ctx.fillStyle = obj.color;
            if (obj.filter) ctx.filter = obj.filter
            ctx.strokeStyle = obj.color;
            ctx.lineWidth = obj.lineWidth;
            const size = Math.max(obj.minScreenSize, obj.size * this.zoom)
            if (obj.rotation) ctx.rotate(obj.rotation + Math.PI/2);

            switch (obj.shape) {
                case SHAPES.Dot:
                    ctx.fillRect(-1, -1, 2, 2);
                    break;

                case SHAPES.FilledCircle:
                    ctx.beginPath();
                    ctx.arc(0, 0, size, 0, Math.PI * 2);
                    ctx.fill();
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
                    break;

                case SHAPES.Text:
                    ctx.font = `${obj.size}px "Google Sans Code"`;
                    ctx.font
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 2;
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
