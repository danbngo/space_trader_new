

// Cargo class
class CountsMap {
    constructor(counts = new Map([['key',0]])) {
        this.counts = counts
    }

    getAmount(key = 'key') {
        return this.counts.get(key) || 0
    }

    increment(key = 'key', amt = 0) {
        this.counts.set(key, this.getAmount(key) + amt)
    }

    setAmount(key = 'key', amt = 0) {
        this.counts.set(key, amt)
    }

    get total() {
        return calcMapValuesTotal(this.counts)
    }
    
    randomItem(weighted = true) {
        const ctWeights = []
        const keys = Array.from(this.counts.keys())
        for (const ct of keys) ctWeights.push(weighted ? this.getAmount(ct) : (this.getAmount(ct) > 0 ? 1 : 0))
        console.log('ct weights:',ctWeights)
        console.log('keys:',keys)
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = keys[ctIndex]
        console.log('random ct index:',ctIndex,'ct selected:',ct,'from keys:',keys)
        return ct
    }

    //probably not mathematically correct but oh well
    randomSubset(amt = 0) {
        const subset = new CountsMap()
        amt = Math.min(this.total, amt)
        while (amt > 0) {
            const ct = this.randomItem()
            console.log('amt left to pick:',amt,'ct selected:',ct,'source amt:',this.getAmount(ct),'subset amt:',subset.getAmount(ct))
            if (!ct) break
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
            amt--
            console.log('added:',ct,'amt remaining:',amt)
        }
        return subset
    }

    add(added = new CountsMap()) {
        for (const [key, amt] of added.counts) {
            this.increment(key, amt)
        }
    }

    subtract(subtracted = new CountsMap()) {
        for (const [key, amt] of subtracted.counts) {
            this.increment(key, -amt)
        }
    }
}
