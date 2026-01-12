/**
 * A loop that runs an animation or timed operation.
 * @class Animaton
 */
class Anim {
    /**
     * @param {number} durationMs - The duration of the loop in milliseconds.
     * @param {function(number): void} onUpdate - Callback function called each frame with progress ratio (0-1).
     * @param {function(): void} onComplete - Callback function called when the loop completes.
     */
    constructor(durationMs = 1000, onUpdate = (progressRatio = 0)=>{}, onComplete = ()=>{}) {
        /** @type {number} */
        this.durationMs = durationMs;
        /** @type {function(number): void} */
        this.onUpdate = onUpdate;
        /** @type {function(): void} */
        this.onComplete = onComplete;
        /** @type {number} */
        this.startTime = null;
        /** @type {number} */
        this.requestId = null;
        /** @type {number} */
        this.startMs = null;
        /** @type {boolean} */
        this.completed = false;
        this.update()
    }
    update(currentMs = Date.now()) {
        if (this.completed) return;
        console.log('anim running, time:', currentMs, 'start:', this.startTime, 'duration:', this.durationMs);
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