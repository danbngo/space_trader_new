function generateCulture(planet = new Planet()) {
    const shipQuality = Math.random() > .5 ? 1/rng(3,1,false) : rng(3,1,false)
    const officerQuality = Math.random() > .5 ? 1/rng(3,1,false) : rng(3,1,false)

    const cargoPriceModifiers = new CountsMap()
    for (const ct of CARGO_TYPES_ALL) {
        cargoPriceModifiers.setAmount(ct, Math.random() > .5 ? 1/rng(5,1,false) : rng(5,1,false))
    }
    const patrolRange = rng(10,2,false)
    return new Culture(cargoPriceModifiers, shipQuality, officerQuality, patrolRange)
}
