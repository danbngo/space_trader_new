/**
 * A building where genetic modifications can be purchased and applied.
 * @class Geneticist
 * @extends {Building}
 */
class Geneticist extends Building {
    /**
     * @param {Planet} planet - The planet this geneticist is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.GENETICIST, moon)
        /** @type {GeneticModification[]} */
        this.modifications = []; // GeneticModification[]
        this.normalize(true)
    }
    get baseNumModifications() {
        return this.planet.c.technology * GENETICIST_AVERAGE_NUM_MODIFICATIONS * this.level
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.modifications = []
        }
        const modDiffFromBase = this.modifications.length - this.baseNumModifications
        if (modDiffFromBase > 0) {
            this.modifications.splice(0, modDiffFromBase)
        } else if (modDiffFromBase < 0) {
            for (let i = 0; i < -modDiffFromBase; i++) {
                this.modifications.push(generateGeneticModification(this.planet))
            }
        }
    }

    calcBuyModificationPrice(modification = new GeneticModification()) {
        return Math.round(modification.modificationType.value * modification.quality * (1+this.planet.c.corruption))
    }
}


/**
 * Generates a genetic modification with quality based on planet.
 * @param {Planet} planet - The planet determining modification quality.
 * @param {GeneticModificationType} modificationType - The type of modification to generate.
 * @returns {GeneticModification} The generated genetic modification.
 */
function generateGeneticModification(planet = new Planet(), modificationType = rndMember(GENETIC_MODIFICATION_TYPES_ALL)) {
    const technology = planet ? planet.c.technology : 1
    const quality = rng(2, 0.5, false)*technology
    return new GeneticModification(modificationType, quality)
}
