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
     * @param {Guild} params.guild - The guild building.
     * @param {Courthouse} params.courthouse - The courthouse building.
     * @param {Bank} params.bank - The bank building.
     */
    constructor({planet = new Planet(), settlementType = null, shipyard = null, market = null, guild = null, courthouse = null, bank=null}) {
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
        /** @type {Guild} */
        this.guild = guild;
        /** @type {Courthouse} */
        this.courthouse = courthouse
        /** @type {Bank} */
        this.bank = null
        
        gameRegistry.registerSettlement(this)
    }
    get buildings() {
        return [this.guild, this.market, this.shipyard, this.courthouse, this.bank].filter(b=>b!=null)
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
            planet: this.planet, settlementType: this.settlementType, bank: this.bank ? this.bank.clone() : null, courthouse: this.courthouse ? this.courthouse.clone() : null, shipyard: this.shipyard ? this.shipyard.clone() : null, market: this.market ? this.market.clone() : null, guild: this.guild ? this.guild.clone() : null
        })
    }
}
