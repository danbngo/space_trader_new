
class Path {
    constructor(startX = 0, startY = 0, endX = 0, endY = 0, normalize = true) {
        this.startX = startX
        this.startY = startY
        this.endX = endX
        this.endY = endY
        this.left = Math.min(this.startX, this.endX)
        this.top = Math.min(this.startY, this.endY)
        this.right = Math.max(this.startX, this.endX)
        this.bottom = Math.max(this.startY, this.endY)
        this.width = (this.right-this.left)
        this.height = (this.bottom-this.top)
        this.distance = Math.sqrt(this.width*this.width + this.height*this.height);
        this.dx = this.endX - this.startX
        this.dy = this.endY - this.startY
        this.angle = Math.atan2(this.dy, this.dx);
        this.angleDeg = radiansToDegrees(this.angle) // convert to degrees
        this.normalize = normalize
    }

    positionAtProgress(progressRatio = 0.0) {
        if (progressRatio <= 0) return [this.startX, this.startY]
        if (progressRatio >= 1) return [this.endX, this.endY]
        const effectiveProgress = this.normalize ? normalCurve(progressRatio) : progressRatio
        return [this.startX + this.dx*effectiveProgress, this.startY + this.dy*effectiveProgress]
    }

}
