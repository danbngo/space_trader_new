

/**
 * A map that tracks counts/amounts of various items or entities.
 * @class CountsMap
 */
class CountsMap {
    /**
     * @param {Map<any,number>} counts - A map of items to their counts.
     */
    constructor(counts = new Map()) {
        /** @type {Map<any,number>} */
        this.counts = counts
    }

    /**
     * Creates a deep copy of this CountsMap.
     * @returns {CountsMap} A new CountsMap with the same entries.
     */
    clone() {
        const newCounts = new Map()
        for (const [key, amt] of this.counts) {
            newCounts.set(key, amt)
        }
        return new CountsMap(newCounts)
    }

    /**
     * Gets the count for a specific key.
     * @param {any} key - The key to look up.
     * @returns {number} The count for the key, or 0 if not found.
     */
    getAmount(key = {}) {
        return this.counts.get(key) || 0
    }

    /**
     * Gets the number of unique keys in the map.
     * @returns {number} The number of entries.
     */
    get size() {
        return this.counts.size
    }

    /**
     * Increments the count for a key by a specific amount. Removes the key if count drops to or below 0.
     * @param {any} key - The key to increment.
     * @param {number} amt - Amount to add (default 1, can be negative).
     */
    increment(key = {}, amt = 1) {
        const newAmt = this.getAmount(key) + amt
        if (newAmt <= 0) {
            this.counts.delete(key)
            return
        }
        this.counts.set(key, newAmt)
    }

    /**
     * Multiplies the count for a key by a specific factor. Removes the key if result is 0 or negative.
     * @param {any} key - The key to multiply.
     * @param {number} amt - Factor to multiply by (default 1).
     */
    multiply(key = {}, amt = 1) {
        const newAmt = this.getAmount(key) * amt
        if (newAmt <= 0) {
            this.counts.delete(key)
            return
        }
        this.counts.set(key, newAmt)
    }

    /**
     * Sets the count for a key to the specified amount, but only if greater than current.
     * @param {any} key - The key to update.
     * @param {number} amt - The minimum amount to ensure.
     */
    raiseTo(key = {}, amt = 1) {
        const currentAmt = this.getAmount(key)
        if (amt > currentAmt) {
            this.counts.set(key, amt)
        }
    }

    /**
     * Sets the count for a key to an exact amount.
     * @param {any} key - The key to set.
     * @param {number} amt - The amount to set.
     */
    setAmount(key = {}, amt = 0) {
        this.counts.set(key, amt)
    }

    /**
     * Calculates the average value across all entries.
     * @returns {number} The average value (total / size).
     */
    get average() {
        return this.total/this.size
    }

    /**
     * Calculates the sum of all values in the map.
     * @returns {number} The total of all counts.
     */
    get total() {
        return calcMapValuesTotal(this.counts)
    }
    
    /**
     * Selects a random key from the map, optionally weighted by their counts.
     * @param {boolean} weighted - If true, keys with higher counts are more likely (default true).
     * @returns {any} A randomly selected key.
     */
    randomItem(weighted = true) {
        const ctWeights = []
        const keys = Array.from(this.keys)
        for (const ct of keys) ctWeights.push(weighted ? this.getAmount(ct) : (this.getAmount(ct) > 0 ? 1 : 0))
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = keys[ctIndex]
        return ct
    }

    /**
     * Removes all entries from the map.
     */
    clear() {
        this.counts.clear()
    }

    /**
     * Gets all keys in the map as an array.
     * @returns {any[]} Array of all keys.
     */
    get keys() {
        return Array.from(this.counts.keys())
    }

    /**
     * Normalizes all numeric values so they maintain the same ratios but sum to toAmount.
     * @param {number} toAmount - The target sum (default 1.0 for percentages)
     */
    normalize(toAmount = 1.0) {
        const currentTotal = this.total
        if (currentTotal === 0 || currentTotal === toAmount) return
        
        const multiplier = toAmount / currentTotal
        for (const [key, value] of this.counts.entries()) {
            this.counts.set(key, value * multiplier)
        }
    }

    /**
     * Creates a random subset of entries with a specific total count.
     * Note: This may not be statistically rigorous for all use cases.
     * @param {number} amt - The total count desired in the subset.
     * @returns {CountsMap} A new CountsMap containing the random subset.
     */
    randomSubset(amt = 0) {
        const subset = new CountsMap()
        amt = Math.min(this.total, amt)
        while (amt > 0) {
            const ct = this.randomItem()
            //console.log('amt left to pick:',amt,'ct selected:',ct,'source amt:',this.getAmount(ct),'subset amt:',subset.getAmount(ct))
            if (!ct) break
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
            amt--
            //console.log('added:',ct,'amt remaining:',amt)
        }
        return subset
    }

    /**
     * Adds all counts from another CountsMap to this one.
     * @param {CountsMap} added - The CountsMap to add.
     */
    addAmounts(added = new CountsMap()) {
        for (const [key, amt] of added.counts) {
            this.increment(key, amt)
        }
    }

    /**
     * Subtracts all counts from another CountsMap from this one.
     * @param {CountsMap} subtracted - The CountsMap to subtract.
     */
    subtractAmounts(subtracted = new CountsMap()) {
        for (const [key, amt] of subtracted.counts) {
            this.increment(key, -amt)
        }
    }

    /**
     * Checks if a key exists with a count greater than 0.
     * @param {any} key - The key to check.
     * @returns {boolean} True if the key has a positive count.
     */
    has(key = {}) {
        return this.getAmount(key) > 0
    }

    /**
     * Custom serialization for JSON.stringify. Converts Map to object with string keys.
     * @returns {Object} An object representation with counts property.
     */
    toJSON() {
        // Custom serialization for JSON.stringify
        // Convert Map to object, preferring UUID, then falling back to name
        const obj = {}
        for (const [key, amount] of this.counts) {
            if (!key) {
                console.warn('CountsMap.toJSON: Encountered null/undefined key, skipping');
                continue;
            }
            // Prefer UUID if available, otherwise fall back to name, or String conversion
            const jsonKey = key?.uuid || key?.name || String(key);
            if (!jsonKey || jsonKey === '[object Object]') {
                console.warn('CountsMap.toJSON: Unable to serialize key:', key);
                continue;
            }
            obj[jsonKey] = amount
        }
        return { counts: obj }
    }

    /**
     * Creates a new CountsMap with inverted values (1/value for each entry).
     * @returns {CountsMap} A new CountsMap with reciprocal values.
     */
    calcInvertedMultipliers() {
        const inverted = new CountsMap()
        for (const [key, value] of this.counts) {
            if (value !== 0) {
                inverted.setAmount(key, 1 / value)
            }
        }
        return inverted
    }

    /**
     * Returns the key with the highest value in the map.
     * @returns {any|null} The key with the highest value, or null if empty.
     */
    calcHighestKey() {
        if (this.counts.size === 0) return null
        
        let maxKey = null
        let maxValue = -Infinity
        
        for (const [key, value] of this.counts) {
            if (value > maxValue) {
                maxValue = value
                maxKey = key
            }
        }
        
        return maxKey
    }

    /**
     * Returns all keys sorted by their values from highest to lowest.
     * @returns {any[]} Array of keys sorted in descending order by value.
     */
    calcHighestKeys() {
        const entriesArray = Array.from(this.counts.entries())
        entriesArray.sort((a, b) => b[1] - a[1]) // Sort descending by value
        return entriesArray.map(entry => entry[0]) // Return sorted keys
    }
}
