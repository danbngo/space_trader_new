class CanvasObject {
    /**
    * @param {Object} params
    * @param {string} params.id
    * @param {typeof SHAPES[keyof typeof SHAPES]} params.shape
    * @param {number} params.x
    * @param {number} params.y
    * @param {number} params.size
    * @param {number} [params.minorSize]
    * @param {number} [params.angle]
    * @param {string | null} [params.textContent]
    * @param {function(CanvasObject):void | null} [params.onClick]
    * @param {function(CanvasObject):void | null} [params.onHover]
    * @param {function(CanvasObject):void | null} [params.onHoverEnd]
    * @param {number} [params.x2]
    * @param {number} [params.y2]
    * @param {number} [params.lineWidth]
    * @param {number} [params.screenOffsetX]
    * @param {number} [params.screenOffsetY]
    * @param {number} [params.minScreenSize]
    * @param {boolean} [params.visible]
    * @param {string | null} [params.fontModifier]
    * @param {number[] | null} [params.fillColor]
    * @param {number[] | null} [params.strokeColor]
    * @param {number | null} [params.durationMs]
    * @param {number} [params.zIndex] - Draw order priority (higher values draw on top)
    * @param {Array<[number, number]>} [params.vertices] - Array of [x, y] coordinates for polygon shape
    * @param {string | HTMLImageElement | null} [params.src] - Image source for bitmap rendering
    * @property {number} centerOpacity - For radial gradient
    * @property {number} centerOpacity - For radial gradient
    * @property {number} edgeOpacity - For radial gradient
    */
    constructor({
        id = '',
        shape = SHAPES.FilledCircle,
        x = 0,
        y = 0,
        size = 1,        // for triangle
        minorSize = 1,   // for oval
        angle = 0,    // radians for triangle
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
        durationMs = null,
        zIndex = 0,
        vertices = [],
        src = null
    }) {
        this.id = id;
        this.shape = shape;
        
        this.x = x;
        this.y = y;
        this.size = size;
        this.size = size;
        this.minorSize = minorSize;
        this.angle = angle;
        
        /** @type {number[] | null} */
        this.fillColor = fillColor ? [...fillColor] : null;
        /** @type {number[] | null} */
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
        this.clickPriority = 0; // Higher priority = clicked first (planets: 10, default: 0)
        this.zIndex = zIndex; // Higher values draw on top
        
        /** @type {Array<[number, number]>} */
        this.vertices = vertices || [];

        this.startMs = Date.now();
        this.durationMs = durationMs;
        this.endMs = durationMs ? this.startMs + durationMs : null;
        this.initialScreenOffsetY = screenOffsetY;
        this.expired = false

        // For bitmap rendering
        this.src = src;
        this.image = null;
        this.imageLoaded = false;
        if (src && typeof src === 'string') {
            this.image = new Image();
            this.image.onload = () => { this.imageLoaded = true; };
            this.image.src = src;
        } else if (src instanceof HTMLImageElement) {
            this.image = src;
            this.imageLoaded = src.complete;
        }

        this.parallax = false
        this.overlap = false
    }

    setDurationMs(durationMs = 1000) {
        this.durationMs = durationMs;
        this.endMs = durationMs ? this.startMs + durationMs : null;
        this.initialScreenOffsetY = this.screenOffsetY;
        this.expired = false
    }

    /**
     * Check if the popup has expired
     * @param {number} currentMs - Current timestamp in milliseconds
     * @returns {boolean}
     */
    isExpired(currentMs) {
        return this.endMs !== null && currentMs > this.endMs
    }

    /**
     * Calculate the animation progress from 0 to 1
     * @param {number} currentMs - Current timestamp in milliseconds
     * @returns {number}
     */
    getProgress(currentMs) {
        return (currentMs - this.startMs) / (this.endMs - this.startMs)
    }

    /**
     * Calculate the current Y offset based on animation progress
     * @param {number} currentMs - Current timestamp in milliseconds
     * @returns {number}
     */
    getCurrentOffsetY(currentMs) {
        const progress = this.getProgress(currentMs)
        return this.initialScreenOffsetY - DEFAULT_FONT_SIZE * progress
    }

    /**
     * Calculate the current alpha (opacity) based on animation progress
     * @param {number} currentMs - Current timestamp in milliseconds
     * @returns {number}
     */
    getCurrentAlpha(currentMs) {
        const progress = this.getProgress(currentMs)
        return 1 + (0.25 - 1) * progress
    }

    /**
     * Get the current color with animated alpha
     * @param {number} currentMs - Current timestamp in milliseconds
     * @returns {number[]}
     */
    getCurrentColor(currentMs) {
        const alpha = this.getCurrentAlpha(currentMs)
        return [this.fillColor[0], this.fillColor[1], this.fillColor[2], alpha]
    }

    refresh(currentMs = Date.now()) {
        if (!this.durationMs) return
        if (this.isExpired(currentMs)) {
            this.visible = false
            this.expired = true
            return
        }
        this.screenOffsetY = this.getCurrentOffsetY(currentMs)
        this.fillColor = this.getCurrentColor(currentMs)
    }

    
    draw(currentMs, ctx, size = 1, sx = 0, sy = 0, x2Offset = 0, y2Offset = 0, overrideStrokeColor = undefined) {
        this.refresh(currentMs)
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
            ctx.ellipse(0, 0, size, minorSize, this.angle, 0, Math.PI * 2);
            ctx.fill();
            if (this.strokeColor) ctx.stroke()
                //if (this.angle) ctx.rotate(this.angle);
            break;
            
            case SHAPES.FilledRectangle:
            // size is the width, minorSize is the height
            if (this.angle) ctx.rotate(this.angle);
            ctx.fillRect(-size / 2, -minorSize / 2, size, minorSize);
            if (this.strokeColor) ctx.strokeRect(-size / 2, -minorSize / 2, size, minorSize);
            break;
            
            case SHAPES.EmptyRectangle:
            // size is the width, minorSize is the height
            ctx.strokeRect(-size / 2, -minorSize / 2, size, minorSize);
            break;
            
            case SHAPES.EmptyCircle:
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
            case SHAPES.EmptyOval:
            ctx.beginPath();
            ctx.ellipse(0, 0, size, minorSize, this.angle, 0, Math.PI * 2);
            ctx.stroke();
            break;
            
            case SHAPES.FilledTriangle:
            if (this.angle) ctx.rotate(this.angle);
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
            
            case SHAPES.EmptyTriangle:
            if (this.angle) ctx.rotate(this.angle);
            ctx.beginPath();
            // tip (pointing right)
            ctx.moveTo(minorSize / 2, 0);
            // base top
            ctx.lineTo(-minorSize / 2, -size / 2);
            // base bottom
            ctx.lineTo(-minorSize / 2, size / 2);
            ctx.closePath();
            ctx.stroke();
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
            ctx.lineWidth = this.size || ctx.lineWidth
            ctx.beginPath();
            ctx.moveTo(0, 0); // start point
            ctx.lineTo(x2Offset, y2Offset); // end point
            ctx.stroke();       // actually draw it
            break;
            
            case SHAPES.Polygon:
            if (this.vertices && this.vertices.length > 2) {
                if (this.angle) ctx.rotate(this.angle);
                ctx.beginPath();
                // Scale vertices by size
                const scaledVertices = this.vertices.map(([vx, vy]) => [vx * size, vy * size]);
                ctx.moveTo(scaledVertices[0][0], scaledVertices[0][1]);
                for (let i = 1; i < scaledVertices.length; i++) {
                    ctx.lineTo(scaledVertices[i][0], scaledVertices[i][1]);
                }
                ctx.closePath();
                if (this.fillColor) ctx.fill();
                if (this.strokeColor) ctx.stroke();
            }
            break;
            
            case SHAPES.ClearCircle:
            ctx.globalCompositeOperation = 'destination-out'; // Cuts out pixels where you draw
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2, false);
            ctx.fill(); // Fills the circle with transparency
            ctx.globalCompositeOperation = 'source-over'; // Reset for normal drawing

            case SHAPES.Bitmap:
            if (this.image && this.imageLoaded) {
                if (this.angle) ctx.rotate(this.angle);
                
                // Calculate dimensions maintaining aspect ratio
                const aspectRatio = this.image.width / this.image.height;
                let width, height;
                
                if (this.overlap) {
                    // Overlap mode: ensure bitmap covers AT LEAST the target size
                    // Smaller dimension matches size, larger scales proportionally
                    if (aspectRatio > 1) {
                        // Width is larger - match height to size, width scales up
                        height = size;
                        width = size * aspectRatio;
                    } else {
                        // Height is larger or square - match width to size, height scales up
                        width = size;
                        height = size / aspectRatio;
                    }
                } else {
                    // Normal mode: ensure bitmap fits WITHIN the target size
                    // Larger dimension matches size, smaller scales proportionally
                    if (aspectRatio > 1) {
                        // Width is larger
                        width = size;
                        height = size / aspectRatio;
                    } else {
                        // Height is larger or square
                        height = size;
                        width = size * aspectRatio;
                    }
                }
                
                // Apply color tint using globalCompositeOperation if fillColor is set
                if (this.fillColor && (this.fillColor[0] !== 255 || this.fillColor[1] !== 255 || this.fillColor[2] !== 255)) {
                    ctx.save();
                    // Draw image normally first with alpha
                    ctx.globalAlpha = this.fillColor[3] || 1;
                    ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
                    // Apply color tint
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = colorArrToRgbaString([this.fillColor[0], this.fillColor[1], this.fillColor[2], 1]);
                    ctx.fillRect(-width / 2, -height / 2, width, height);
                    // Restore alpha channel (preserves transparency)
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
                    ctx.restore();
                } else {
                    // Draw image normally with opacity (transparency is preserved automatically)
                    ctx.globalAlpha = this.fillColor ? this.fillColor[3] || 1 : 1;
                    ctx.drawImage(this.image, -width / 2, -height / 2, width, height);
                }
            }
            break;
        }
        
        ctx.restore();
    }
    
    asImage(size = 0, strokeColor = undefined) {
        //console.log('drawing canvasobj as image:',size,strokeColor,this)
        const diameter = size*2
        const c = document.createElement("canvas");
        c.width = c.height = diameter;
        const ctx = c.getContext("2d");
        
        this.draw(0, ctx, size, size, size, 0, 0, strokeColor)
        
        return c;
    }
    
}