class Loop {
    constructor(durationMs = 1000, onUpdate = (progressRatio = 0)=>{}, onComplete = ()=>{}) {
        this.durationMs = durationMs;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.startTime = null;
        this.requestId = null;
        this.startMs = null;
        this.completed = false;
        this.update()
    }
    update(currentMs = Date.now()) {
        if (this.completed) return;
        if (this.startTime === null) {
            this.startTime = currentMs;
        }
        const elapsedMs = currentMs - this.startTime;
        const progressRatio = Math.min(elapsedMs / this.durationMs, 1);
        this.onUpdate(progressRatio);
        if (progressRatio >= 1) {
            this.completed = true
            this.onComplete();
        }
    }
}