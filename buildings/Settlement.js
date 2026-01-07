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
     * @param {Tavern} params.tavern - The tavern building.
     * @param {CyberSurgeon} params.cyberSurgeon - The cyber surgeon building.
     * @param {Geneticist} params.geneticist - The geneticist building.
     * @param {Palace} params.palace - The palace building.
     * @param {Temple} params.temple - The temple building.
     * @param {Casino} params.casino - The casino building.
     */
    constructor({planet = new Planet(), settlementType = null, shipyard = null, market = null, blackMarket = null, guild = null, bank = null, courthouse = null, academy = null, tavern = null, cyberSurgeon = null, geneticist = null, palace = null, temple = null, casino = null}) {
        /** @type {string} */
        this.uuid = generateUUID('settlement_')
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
        /** @type {Tavern} */
        this.tavern = tavern;
        /** @type {CyberSurgeon} */
        this.cyberSurgeon = cyberSurgeon;
        /** @type {Geneticist} */
        this.geneticist = geneticist;
        /** @type {Palace} */
        this.palace = palace;
        /** @type {Temple} */
        this.temple = temple;
        /** @type {Casino} */
        this.casino = casino;
        
        gameRegistry.registerSettlement(this)
    }
    get buildings() {
        return [this.academy, this.bank, this.blackMarket, this.casino, this.courthouse, this.cyberSurgeon, this.geneticist, this.guild, this.market, this.palace, this.shipyard, this.tavern, this.temple]
    }
    get damagableBuildings() {
        return this.buildings.filter(b=>(b.exists && b.level > 0))
    }
    get improvableBuildings() {
        return this.buildings.filter(b=>(b.exists))
    }

    /**
     * Creates a deep clone of this settlement for memory/scanning purposes.
     * Clones all buildings but keeps references to planet and types.
     * @returns {Settlement} A cloned copy of this settlement.
     */
    clone() {
        return new Settlement({
            // @ts-ignore
            planet: this.planet, settlementType: this.settlementType, shipyard: this.shipyard ? this.shipyard.clone() : null, market: this.market ? this.market.clone() : null, blackMarket: this.blackMarket ? this.blackMarket.clone() : null, guild: this.guild ? this.guild.clone() : null, bank: this.bank ? this.bank.clone() : null, courthouse: this.courthouse ? this.courthouse.clone() : null, academy: this.academy ? this.academy.clone() : null, tavern: this.tavern ? this.tavern.clone() : null, cyberSurgeon: this.cyberSurgeon ? this.cyberSurgeon.clone() : null, geneticist: this.geneticist ? this.geneticist.clone() : null, palace: this.palace ? this.palace.clone() : null, temple: this.temple ? this.temple.clone() : null, casino: this.casino ? this.casino.clone() : null
        })
    }
}
