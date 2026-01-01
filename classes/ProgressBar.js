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
     * @param {string} options.id - Unique identifier for the progress bar
     * @param {string} [options.label] - Text label to show (e.g., "Generating history" or "Humans")
     * @param {number} [options.value=0] - Initial value (0-100)
     * @param {string} [options.fillColor] - Color for the fill (defaults to COLORS.Green)
     * @param {string} [options.bgColor] - Color for the background (defaults to COLORS.DarkGray)
     * @param {string} [options.borderColor] - Color for the border (defaults to COLORS.White)
     * @param {boolean} [options.showPercentage=true] - Whether to show percentage value
     * @param {string} [options.suffix='%'] - The suffix to display after the value (e.g., '%', 'kg', or '')
     * @param {string} [options.minLabelWidth] - Minimum width for the label (e.g., '12em') for alignment
     * @param {number} [options.width=20] - Number of characters in the ASCII bar visualization
     */
    constructor(options) {
        const {
            id,
            label = '',
            value = 0,
            fillColor = rgbArrayToString(COLORS.Green),
            bgColor = rgbArrayToString(COLORS.DarkGray),
            borderColor = rgbArrayToString(COLORS.White),
            showPercentage = true,
            suffix = '%',
            minLabelWidth = null,
            width = 20
        } = options

        this.label = label
        this.fillColor = fillColor
        this.bgColor = bgColor
        this.borderColor = borderColor
        this.showPercentage = showPercentage
        this.suffix = suffix
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
            children: this.showPercentage ? [`${Math.round(0)}${this.suffix}`] : ['']
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
        let text = this.label
        
        // Add ASCII progress bar visualization
        const barLength = this.width
        const filledLength = Math.round((percentage / 100) * barLength)
        const emptyLength = barLength - filledLength
        const asciiBar = '[' + '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ']'
        
        text += ' ' + asciiBar
        
        return text
    }

    /**
     * Updates the progress bar display
     * @param {number} percentage - Progress percentage (0-100)
     */
    update(percentage) {
        if (this.textElement) {
            this.textElement.textContent = this._formatText(percentage)
        }
        
        if (this.percentageElement && this.showPercentage) {
            this.percentageElement.textContent = `${Math.round(percentage)}${this.suffix}`
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
