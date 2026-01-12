class MerchantsEncounter extends Encounter {
    
    /**
     * Override onStart to show merchant contact modal instead of going straight to combat
     */
    onStart() {
        super.onStart()
        const fleetName = coloredName(this.fleet)
        const wantsToTrade = Math.random() > 0.5
        
        let msg = `You encounter ${fleetName}!<br/><br/>`
        
        if (wantsToTrade) {
            msg += `The merchant fleet signals they're open for business.<br/>`
            msg += `"Greetings traveler! Care to trade?"<br/>`
            
            showModal(fleetName, msg, [
                ['Trade', () => this.showTradeOfferModal()],
                ['Attack', () => this.showPlayerAttackModal()],
                ['Leave', () => this.endEncounter()]
            ], '', null, 0)
        } else {
            msg += `The merchant fleet broadcasts on all channels:<br/>`
            msg += `"Would love to stay and chat, but we're late to drop the cargo. Maybe next time."<br/>`
            
            showModal(fleetName, msg, [
                ['Attack', () => this.showPlayerAttackModal()],
                ['Leave', () => this.endEncounter()]
            ], '', null, 0)
        }
    }

    /**
     * Called when the player wins the encounter. Override in subclasses.
     */
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player loses the encounter. Override in subclasses.
     */
    onDefeat() {
        this.showPlayerDefeatedByNeutralsModal()
    }

    /**
     * Called when the player escapes the encounter. Override in subclasses.
     */
    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }
    
    /**
     * Initiate combat with the merchant
     */
    startCombat() {
        // Initialize combat system
        if (this.fleet && this.fleet.ships && this.fleet.ships.length > 0) {
            this.combat = new Combat(gs.fleet, this.fleet)
            this.combat.start(true) // Player has initiative by default
        }
        closeModal()
        
        // TravelMap will automatically pick up combatEnabled flag and switch to combat UI
        //this.endEncounter() - this was wrong, ending encounter ends combat too.
    }
    
    showTradeOfferModal(allowSell = true, buyCargoTypes = null, sellCargoTypes = null) {
        if (allowSell && Math.random() > .5) this.showTradeOfferPlayerSellModal(sellCargoTypes) 
        else this.showTradeOfferPlayerBuyModal(buyCargoTypes)
    }

    showTradeOfferPlayerSellModal(cargoTypesOfInterest = null) {
        let msg = ''
        const fleetName = coloredName(this.fleet)
        
        // Filter player cargo by types of interest if specified
        let availableCargo = gs.fleet.cargo.keys;
        if (cargoTypesOfInterest && cargoTypesOfInterest.length > 0) {
            availableCargo = availableCargo.filter(ct => cargoTypesOfInterest.includes(ct));
        }
        
        const ct = availableCargo.length > 0 ? availableCargo[Math.floor(Math.random() * availableCargo.length)] : null;
        let onSell = null;

        msg += `The ${fleetName} examine your cargo.<br/>`

        if (!ct || gs.fleet.cargo.getAmount(ct) <= 0) {
            msg += `They don't seem interested in what you have.<br/>`
        }
        else {
            // Calculate price based on barter skill
            const barterMultiplier = gs.fleet.calcBarterPriceMultiplier(this.fleet, false);
            const pricePerUnit = Math.ceil(ct.value * barterMultiplier)
            
            // Check how much they can afford
            const maxAffordableAmount = Math.floor(this.fleet.captain.credits / pricePerUnit);
            const maxSellAmount = Math.min(gs.fleet.cargo.getAmount(ct), maxAffordableAmount);
            
            if (maxSellAmount <= 0) {
                msg += `They don't have enough credits to buy from you.<br/>`
            }
            else {
                const sellAmount = rng(maxSellAmount, 1)
                const totalPrice = pricePerUnit * sellAmount
                const officersShare = gs.fleet.calcTotalCRShare(totalPrice, true)
                const finalSale = totalPrice - officersShare
                
                onSell = () => {
                    gs.fleet.cargo.increment(ct, -sellAmount)
                    gs.credits += finalSale
                    this.fleet.captain.credits -= totalPrice
                    showModal(fleetName, 
                        `You sold ${sellAmount} units of ${ct.symbol} ${coloredName(ct)} for ${totalPrice}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>
                        Transaction complete.<br/>`, [['Continue', ()=>this.endEncounter()]], '', null, 0)
                }

                msg += `They offer to buy ${sellAmount} ${ct.symbol} ${coloredName(ct)} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`
                msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
                msg += `Your amount after sale: ${gs.fleet.cargo.getAmount(ct) - sellAmount}<br/>`
                msg += `Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}<br/>`
                msg += `Your CR after sale: ${gs.credits + finalSale}CR.<br/>`
            }
        }

        showModal(fleetName, msg, onSell ? [
            ['Accept', ()=>onSell()],
            ['Decline', ()=>this.endEncounter()]
        ] :
        [['Continue', ()=>this.endEncounter()]], '', null, 0)
    }

    showTradeOfferPlayerBuyModal(cargoTypesOfInterest = null) {
        let msg = ''
        const fleetName = coloredName(this.fleet)
        
        // Filter fleet cargo by types of interest if specified
        let availableCargo = this.fleet.cargo.keys;
        if (cargoTypesOfInterest && cargoTypesOfInterest.length > 0) {
            availableCargo = availableCargo.filter(ct => cargoTypesOfInterest.includes(ct));
        }
        
        const ct = availableCargo.length > 0 ? availableCargo[Math.floor(Math.random() * availableCargo.length)] : null;
        const availableCargoSpace = gs.fleet.availableCargoSpace
        let onBuy = null;

        msg += `The ${fleetName} show their cargo.<br/>`
        if (!ct || this.fleet.cargo.getAmount(ct) <= 0) {
            msg += `They have nothing you're interested in.<br/>`
        }
        else if (availableCargoSpace <= 0) {
            msg += `Your cargo bays are full.<br/>`
        }
        else {
            const maxBuyAmount = Math.min(this.fleet.cargo.getAmount(ct), availableCargoSpace)
            const buyAmount = rng(maxBuyAmount, 1)
            
            // Calculate price based on barter skill
            const barterMultiplier = gs.fleet.calcBarterPriceMultiplier(this.fleet, true);
            const pricePerUnit = Math.ceil(ct.value * barterMultiplier)
            const totalPrice = pricePerUnit * buyAmount
            
            msg += `They offer to sell you ${buyAmount} ${ct.symbol} ${coloredName(ct)} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`

            if (gs.credits < totalPrice) {
                msg += `You don't have enough credits for their offer.<br/>`
            }
            else {
                msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
                msg += `Your amount after purchase: ${gs.fleet.cargo.getAmount(ct) + buyAmount}<br/>`
                msg += `Your CR after purchase: ${gs.credits - totalPrice}CR.<br/>`

                onBuy = () => {
                    this.fleet.cargo.increment(ct, -buyAmount)
                    gs.fleet.cargo.increment(ct, buyAmount)
                    gs.credits -= totalPrice
                    this.fleet.captain.credits += totalPrice
                    showModal(fleetName, 
                        `You bought ${buyAmount} units of ${ct.symbol} ${coloredName(ct)} for ${totalPrice}CR.<br/>
                        Transaction complete.<br/>`, [['Continue', ()=>this.endEncounter()]], '', null, 0)
                }
            }
        }
        showModal(fleetName, msg, onBuy ? [
            ['Accept', ()=>onBuy()],
            ['Decline', ()=>this.endEncounter()] 
        ] :
        [['Continue', ()=>this.endEncounter()]], '', null, 0)
    }

}