/**
 * Represents a settlement on a planet with various buildings.
 * @class Settlement
 */
class Settlement {
    /**
     * @param {Planet} planet - The planet this settlement is on.
     * @param {SettlementType} settlementType - The type of settlement.
     * @param {Shipyard} shipyard - The shipyard building.
     * @param {Market} market - The market building.
     * @param {Market} blackMarket - The black market building.
     * @param {Guild} guild - The guild building.
     * @param {Bank} bank - The bank building.
     * @param {Courthouse} courthouse - The courthouse building.
     * @param {Academy} academy - The academy building.
     * @param {Academy} tavern - The tavern building.
     * @param {CyberSurgeon} cyberSurgeon - The cyber surgeon building.
     * @param {Palace} palace - The palace building.
     * @param {Temple} temple - The temple building.
     * @param {Armory} armory - The armory building.
     * @param {Outfitter} outfitter - The outfitter building.
     * @param {Casino} casino - The casino building.
     */
    constructor(planet = new Planet(), settlementType = null, shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null, tavern = null, cyberSurgeon = null, palace = null, temple = null, armory = null, outfitter = null, casino = null) {
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
        return [this.academy, this.armory, this.bank, this.blackMarket, this.casino, this.courthouse, this.cyberSurgeon, this.guild, this.market, this.outfitter, this.palace, this.shipyard, this.tavern, this.temple]
    }
}
