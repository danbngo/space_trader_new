
class Path {
    constructor(startX = 0, startY = 0, toX = 0, toY = 0, normalize = true) {
        this.startX = startX
        this.startY = startY
        this.toX = toX
        this.toY = toY
        this.left = Math.min(this.startX, this.toX)
        this.top = Math.min(this.startY, this.toY)
        this.right = Math.max(this.startX, this.toX)
        this.bottom = Math.max(this.startY, this.toY)
        this.width = (this.right-this.left)
        this.height = (this.bottom-this.top)
        this.distance = Math.sqrt(this.width*this.width + this.height*this.height);
        this.dx = this.toX - this.startX
        this.dy = this.toY - this.startY
        this.angle = Math.atan2(this.dy, this.dx);
        this.angleDeg = radiansToDegrees(this.angle) // convert to degrees
        this.normalize = normalize
    }

    positionAtProgress(progressRatio = 0.0) {
        if (progressRatio <= 0) return [this.startX, this.startY]
        if (progressRatio >= 1) return [this.toX, this.toY]
        const effectiveProgress = this.normalize ? normalCurve(progressRatio) : progressRatio
        return [this.startX + this.dx*effectiveProgress, this.startY + this.dy*effectiveProgress]
    }

}
