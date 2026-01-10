

class CanvasPixel {
    constructor({x = 0, y = 0, color = COLORS.LightGray, size = 1, screenOffsetX = 0, screenOffsetY = 0} = {}) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.screenOffsetX = screenOffsetX;
        this.screenOffsetY = screenOffsetY;
        this.visible = true;
    }
}