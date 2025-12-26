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
     */
    constructor(planet = new Planet(), shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null) {
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
    }

    get buildings() {
        return [this.shipyard, this.market, this.blackMarket, this.guild, this.bank, this.courthouse, this.academy]
    }
}
