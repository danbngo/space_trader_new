/**
 * Represents a settlement on a planet with various buildings.
 * @class Settlement
 */
class Settlement {
    /**
     * @param {Planet} planet - The planet this settlement is on.
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
     */
    constructor(planet = new Planet(), shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null, tavern = null, cyberSurgeon = null, palace = null) {
        /** @type {Planet} */
        this.planet = planet;
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
    }
    get buildings() {
        return [this.academy, this.bank, this.blackMarket, this.courthouse, this.cyberSurgeon, this.guild, this.market, this.palace, this.shipyard, this.tavern]
    }
}
