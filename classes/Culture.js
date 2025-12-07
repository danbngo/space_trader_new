

class Culture {
    constructor(cargoPriceModifiers = new Cargo(), shipQuality = 1.0, patrolRange = 1) {
        this.cargoPriceModifiers = cargoPriceModifiers
        this.shipQuality = shipQuality;
        this.patrolRange = patrolRange; //AUs, recall that neptune is 30
    }
}