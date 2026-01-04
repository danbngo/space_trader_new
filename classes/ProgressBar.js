/**
 * A reusable progress bar component for static data visualization.
 * 
 * @example Static usage:
 * const progressBar = new ProgressBar({id: 'race_human', label: 'Humans', value: 75})
 * // Shows 75% immediately
 */
class ProgressBar {
    /**
     * Creates a new progress bar
     * @param {Object} options - Configuration options
     * @param {string} [options.overrideLabel] - Text label to show (e.g., "Generating history" or "Humans")
     * @param {number} [options.value=0] - Initial value (0-100)
     * @param {string} [options.fillColor] - Color for the fill (defaults to COLORS.Green)
     * @param {string} [options.bgColor] - Color for the background (defaults to COLORS.DarkGray)
     * @param {string} [options.borderColor] - Color for the border (defaults to COLORS.White)
     * @param {string} [options.minLabelWidth] - Minimum width for the label (e.g., '12em') for alignment
     * @param {number} [options.width=20] - Number of characters in the ASCII bar visualization
     */
    constructor(options) {
        const {
            overrideLabel = '',
            value = 0,
            fillColor = rgbArrayToString(COLORS.Green),
            bgColor = rgbArrayToString(COLORS.DarkGray),
            borderColor = rgbArrayToString(COLORS.White),
            minLabelWidth = null,
            width = 20
        } = options

        this.overrideLabel = overrideLabel
        this.fillColor = fillColor
        this.bgColor = bgColor
        this.borderColor = borderColor
        this.minLabelWidth = minLabelWidth
        this.width = width

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
        this.textElement = ce({
            classNames: ['progressBar-text'],
            style: `color: ${rgbArrayToString(COLORS.White)};${this.minLabelWidth ? ` min-width: ${this.minLabelWidth};` : ''}`,
            children: [this._formatText(0)]
        })

        this.percentageElement = ce({
            classNames: ['progressBar-percentage'],
            children: this.overrideLabel ? [this.overrideLabel] : [`${Math.round(0)}$%`]
        })

        this.container = ce({
            classNames: ['progressBar-container'],
            children: [this.textElement, this.percentageElement]
        })
    }

    /**
     * Formats the text display based on options
     * @private
     * @param {number} percentage - Progress percentage (0-100)
     * @returns {string} Formatted text
     */
    _formatText(percentage) {
        // Add ASCII progress bar visualization
        const barLength = this.width
        const filledLength = Math.round((percentage / 100) * barLength)
        const emptyLength = barLength - filledLength
        const asciiBar = '[' + '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ']'
        return asciiBar
    }

    /**
     * Updates the progress bar display
     * @param {number} percentage - Progress percentage (0-100)
     */
    update(percentage) {
        if (this.textElement) {
            this.textElement.textContent = this._formatText(percentage)
        }
        
        if (this.percentageElement) {
            this.percentageElement.textContent = this.overrideLabel ? this.overrideLabel : `${Math.round(percentage)}%`
        }
    }

    /**
     * Gets the internal DOM elements (for advanced usage)
     * @returns {{container: HTMLElement, text: HTMLElement}}
     */
    getElements() {
        return {
            container: this.container,
            text: this.textElement,
        }
    }
}
