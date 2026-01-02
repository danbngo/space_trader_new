/**
 * A building where cybernetic implants can be bought and installed.
 * @class CyberSurgeon
 * @extends {Building}
 */
class CyberSurgeon extends Building {
    /**
     * @param {Planet} planet - The planet this cyber surgeon is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.CYBER_SURGEON, moon)
        /** @type {CyberImplant[]} */
        this.implants = []; // CyberImplant[]
        this.normalize(true)
    }
    get baseNumImplants() {
        return this.planet.c.technology * CYBER_SURGEON_AVERAGE_NUM_IMPLANTS * this.level
    }
    normalize(clearExisting = false) {
        super.normalize()
        if (clearExisting) {
            this.implants = []
        }
        const implantDiffFromBase = this.implants.length - this.baseNumImplants
        if (implantDiffFromBase > 0) {
            this.implants.splice(0, implantDiffFromBase)
        } else if (implantDiffFromBase < 0) {
            for (let i = 0; i < -implantDiffFromBase; i++) {
                this.implants.push(generateCyberImplant(this.planet))
            }
        }
    }

    calcBuyImplantPrice(implant = new CyberImplant()) {
        return Math.round(implant.implantType.value * implant.quality * (1+this.planet.c.corruption))
    }
}


/**
 * Generates a cybernetic implant with quality based on planet.
 * @param {Planet} planet - The planet determining implant quality.
 * @param {CyberImplantType} implantType - The type of implant to generate.
 * @returns {CyberImplant} The generated cybernetic implant.
 */
function generateCyberImplant(planet = new Planet(), implantType = rndMember(CYBER_IMPLANT_TYPES_ALL)) {
    const technology = planet ? planet.c.technology : 1
    const quality = rng(2, 0.5, false)*technology
    return new CyberImplant(implantType, quality)
}
