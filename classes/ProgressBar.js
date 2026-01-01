/**
 * A reusable progress bar component that can be used for both dynamic progress tracking
 * (with elapsed time) and static data visualization (without time).
 * 
 * @example Dynamic usage (with elapsed time):
 * const progressBar = new ProgressBar({id: 'loading', label: 'Loading'})
 * progressBar.update(50, 2.5) // 50%, 2.5 seconds elapsed
 * 
 * @example Static usage (no time):
 * const progressBar = new ProgressBar({id: 'race_human', label: 'Humans', value: 75})
 * // Shows 75% immediately, no time display
 */
class ProgressBar {
    /**
     * Creates a new progress bar
     * @param {Object} options - Configuration options
     * @param {string} options.id - Unique identifier for the progress bar
     * @param {string} options.label - Text label to show (e.g., "Generating history" or "Humans")
     * @param {number} [options.value=0] - Initial value (0-100), for static bars
     * @param {number} [options.height=30] - Height of the progress bar in pixels
     * @param {string} [options.fillColor] - Color for the fill (defaults to COLORS.Green)
     * @param {string} [options.bgColor] - Color for the background (defaults to COLORS.DarkGray)
     * @param {string} [options.borderColor] - Color for the border (defaults to COLORS.White)
     * @param {boolean} [options.showTime=false] - Whether to show elapsed time (for dynamic progress)
     * @param {boolean} [options.showPercentage=true] - Whether to show percentage value
     */
    constructor(options) {
        const {
            id,
            label,
            value = 0,
            height = 30,
            fillColor = rgbArrayToString(COLORS.Green),
            bgColor = rgbArrayToString(COLORS.DarkGray),
            borderColor = rgbArrayToString(COLORS.White),
            showTime = false,
            showPercentage = true
        } = options

        this.id = id
        this.label = label
        this.height = height
        this.fillColor = fillColor
        this.bgColor = bgColor
        this.borderColor = borderColor
        this.showTime = showTime
        this.showPercentage = showPercentage

        this.fillId = `${id}_fill`
        this.textId = `${id}_text`

        this._createElements()
        
        // Set initial value for static bars
        if (value > 0) {
            this.update(value)
        }
    }

    /**
     * Creates the DOM elements for the progress bar
     * @private
     */
    _createElements() {
        this.fillElement = ce({
            id: this.fillId,
            style: `width: 0%; height: ${this.height}px; background-color: ${this.fillColor}; transition: width 0.1s;`
        })

        this.bgElement = ce({
            style: `width: 100%; height: ${this.height}px; background-color: ${this.bgColor}; border: 2px solid ${this.borderColor};`,
            children: [this.fillElement]
        })

        this.textElement = ce({
            id: this.textId,
            style: `text-align: center; margin-top: 10px; color: ${rgbArrayToString(COLORS.White)};`,
            children: [this._formatText(0)]
        })

        this.container = ce({
            children: [this.bgElement, this.textElement]
        })
    }

    /**
     * Formats the text display based on options
     * @private
     * @param {number} percentage - Progress percentage (0-100)
     * @param {number} [elapsedSeconds] - Elapsed time in seconds (optional)
     * @returns {string} Formatted text
     */
    _formatText(percentage, elapsedSeconds) {
        let text = this.label
        
        if (this.showPercentage) {
            text += `: ${Math.round(percentage)}%`
        }
        
        if (this.showTime && elapsedSeconds !== undefined) {
            text += ` (${elapsedSeconds.toFixed(1)}s)`
        }
        
        return text
    }

    /**
     * Updates the progress bar display
     * @param {number} percentage - Progress percentage (0-100)
     * @param {number} [elapsedSeconds] - Elapsed time in seconds (optional, for dynamic progress)
     */
    update(percentage, elapsedSeconds) {
        const fillEl = document.getElementById(this.fillId)
        const textEl = document.getElementById(this.textId)
        
        if (fillEl) {
            fillEl.style.width = Math.min(100, Math.max(0, percentage)) + '%'
        }
        
        if (textEl) {
            textEl.textContent = this._formatText(percentage, elapsedSeconds)
        }
    }

    /**
     * Gets the internal DOM elements (for advanced usage)
     * @returns {{container: HTMLElement, fill: HTMLElement, text: HTMLElement, bg: HTMLElement}}
     */
    getElements() {
        return {
            container: this.container,
            fill: document.getElementById(this.fillId),
            text: document.getElementById(this.textId),
            bg: this.bgElement
        }
    }
}
