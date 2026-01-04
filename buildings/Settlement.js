/**
 * Represents a settlement on a planet with various buildings.
 * @class Settlement
 */
class Settlement {
    /**
     * @param {Object} params - The settlement parameters.
     * @param {Planet} params.planet - The planet this settlement is on.
     * @param {SettlementType} params.settlementType - The type of settlement.
     * @param {Shipyard} params.shipyard - The shipyard building.
     * @param {Market} params.market - The market building.
     * @param {Market} params.blackMarket - The black market building.
     * @param {Guild} params.guild - The guild building.
     * @param {Bank} params.bank - The bank building.
     * @param {Courthouse} params.courthouse - The courthouse building.
     * @param {Academy} params.academy - The academy building.
     * @param {Academy} params.tavern - The tavern building.
     * @param {CyberSurgeon} params.cyberSurgeon - The cyber surgeon building.
     * @param {Geneticist} params.geneticist - The geneticist building.
     * @param {Palace} params.palace - The palace building.
     * @param {Temple} params.temple - The temple building.
     * @param {Armory} params.armory - The armory building.
     * @param {Outfitter} params.outfitter - The outfitter building.
     * @param {Casino} params.casino - The casino building.
     */
    constructor({planet = new Planet(), settlementType = null, shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null, tavern = null, cyberSurgeon = null, geneticist = null, palace = null, temple = null, armory = null, outfitter = null, casino = null}) {
        /** @type {Planet} */
        this.planet = planet;
        /** @type {SettlementType} */
        this.settlementType = settlementType;
        /** @type {Shipyard} */
        this.shipyard = shipyard;
        /** @type {Market} */
        this.market = market;
        /** @type {Market} */
        this.blackMarket = blackMarket;
        /** @type {Guild} */
        this.guild = guild;
        /** @type {Bank} */
        this.bank = bank;
        /** @type {Courthouse} */
        this.courthouse = courthouse;
        /** @type {Academy} */
        this.academy = academy;
        /** @type {Academy} */
        this.tavern = tavern;
        /** @type {CyberSurgeon} */
        this.cyberSurgeon = cyberSurgeon;
        /** @type {Geneticist} */
        this.geneticist = geneticist;
        /** @type {Palace} */
        this.palace = palace;
        /** @type {Temple} */
        this.temple = temple;
        /** @type {Armory} */
        this.armory = armory;
        /** @type {Outfitter} */
        this.outfitter = outfitter;
        /** @type {Casino} */
        this.casino = casino;
    }
    get buildings() {
        return [this.academy, this.armory, this.bank, this.blackMarket, this.casino, this.courthouse, this.cyberSurgeon, this.geneticist, this.guild, this.market, this.outfitter, this.palace, this.shipyard, this.tavern, this.temple]
    }
    get damagableBuildings() {
        return this.buildings.filter(b=>(b.permitted && b.level > 0))
    }
    get improvableBuildings() {
        return this.buildings.filter(b=>(b.permitted))
    }
}
