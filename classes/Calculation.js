/**
 * A class for tracking and displaying multiplicative calculations with reasons.
 * Used to show breakdowns of prices, availability, and other computed values.
 * @class Calculation
 */
class Calculation {
    /**
     * @param {Array<[string, number]>} factors - Array of [reason, multiplier] pairs. Multipliers are ratios (1.0 = no change).
     */
    constructor(factors = []) {
        /** @type {Array<{reason: string, multiplier: number}>} */
        this.factors = factors.map(([reason, multiplier]) => ({reason, multiplier}));
    }

    /**
     * Add a factor to the calculation.
     * @param {string} reason - The reason/label for this factor.
     * @param {number} multiplier - The multiplier ratio (1.0 = no change, 1.5 = +50%, 0.5 = -50%).
     */
    addFactor(reason, multiplier) {
        this.factors.push({reason, multiplier});
    }

    /**
     * Calculate the final value by applying all multipliers to the base value.
     * @param {number} baseValue - The starting value.
     * @returns {number} The final calculated value.
     */
    calculate(baseValue) {
        return this.factors.reduce((value, factor) => value * factor.multiplier, baseValue);
    }

    /**
     * Get the total multiplier (product of all factors).
     * @returns {number} The combined multiplier.
     */
    getTotalMultiplier() {
        return this.factors.reduce((total, factor) => total * factor.multiplier, 1.0);
    }

    /**
     * Create a popover element showing the calculation breakdown.
     * @param {number} baseValue - The base value before modifications.
     * @param {string} baseValueLabel - Label for the base value (e.g., "base price").
     * @returns {HTMLElement} A popover content element.
     */
    createPopover(baseValue, baseValueLabel = 'base value') {
        const totalMultiplier = this.getTotalMultiplier();
        const finalValue = baseValue * totalMultiplier;
        const totalPct = roundToPlaces(100 * (totalMultiplier - 1), 1);

        // Determine color for total based on whether it's good or bad
        // For prices (player buying), lower is better (green). For selling/availability, higher is better.
        // We'll use a neutral coloring: green for positive, red for negative
        const totalColor = totalPct >= 0 ? COLORS.LightGreen : COLORS.LightRed;

        const lines = [
            `${colorSpan(`Total: ${totalPct >= 0 ? '+' : ''}${totalPct}%`, totalColor)} (${roundToPlaces(finalValue, 1)})<br/>`,
            `${baseValueLabel}: ${roundToPlaces(baseValue, 1)}<br/>`
        ];

        // Add each factor
        for (const factor of this.factors) {
            const pct = roundToPlaces(100 * (factor.multiplier - 1), 1);
            if (pct === 0) continue; // Skip factors with no effect

            const sign = pct >= 0 ? '+' : '';
            const color = pct >= 0 ? COLORS.LightGreen : COLORS.LightRed;
            lines.push(`${colorSpan(`${sign}${pct}%`, color)} (${factor.reason})<br/>`);
        }

        return ce({innerHTML: lines.join('')});
    }

    /**
     * Create a colored percentage string suitable for display.
     * @param {number} ratio - The ratio to compare against neutral (1.0 = neutral, higher = better for player).
     * @param {boolean} higherIsBetter - If true, higher values are green. If false, lower values are green.
     * @returns {string} HTML string with colored percentage.
     */
    createColoredPercentageString(ratio = 1.0, higherIsBetter = true) {
        const totalPct = roundToPlaces(100 * (ratio - 1), 1);
        return statColorSpan(`${totalPct >= 0 ? '+' : ''}${totalPct}%`, higherIsBetter ? ratio : 1/ratio);
    }
}
