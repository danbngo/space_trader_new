class MercantileEncounter extends NeutralsEncounter {
        
    showTradeOfferModal(allowSell = true) {
        console.log('showTradeOfferModal');
        if (allowSell && Math.random() > .5) this.showTradeOfferPlayerSellModal() 
        else this.showTradeOfferPlayerBuyModal()
    }

    showTradeOfferPlayerSellModal() {
        console.log('showTradeOfferPlayerSellModal');
        let msg = ''
        const fleetName = coloredName(this.fleet)
        const ct = gs.fleet.cargo.randomItem(false)
        if (!(ct instanceof CargoType)) throw new Error('wrong cargo type!')
        let onSell = null;

        msg += `The ${fleetName} look through your wares.<br/>`

        if (!ct || gs.fleet.cargo.getAmount(ct) <= 0) {
            msg += `Finding no cargo aboard, they chide you for your lack of industry in the mercantile arena.<br/>`
        }
        else {
            const maxSellAmount = gs.fleet.cargo.getAmount(ct)
            const sellAmount = rng(maxSellAmount, 1)
            //no rake but value may vary
            const pricePerUnit = Math.ceil(ct.value * rng(2, 0.5, false))
            const totalPrice = pricePerUnit * sellAmount
            const officersShare = gs.fleet.calcTotalCRShare(totalPrice, true)
            const finalSale = totalPrice - officersShare
            onSell = () => {
                gs.fleet.cargo.increment(ct, -sellAmount)
                gs.credits += finalSale
                showModal(fleetName, 
                    `You sold ${sellAmount} units of ${coloredName(ct)} for ${totalPrice}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>
                    The ${fleetName} thank you and tell you to come again!<br/>`, [['Continue', ()=>this.endEncounter()]])
            }

            msg += `They offer to buy ${sellAmount} ${coloredName(ct)} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`
            msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
            msg += `Your amount after sale: ${gs.fleet.cargo.getAmount(ct) - sellAmount}<br/>`
            msg += `Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}<br/>`
            msg += `Your CR after sale: ${gs.credits + finalSale}CR.<br/>`
        }

        showModal(fleetName, msg, onSell ? [
            ['Sell', ()=>onSell()],
            ['Decline', ()=>this.endEncounter()]
        ] :
        [['Continue', ()=>this.endEncounter()]])
    }

    showTradeOfferPlayerBuyModal() {
        console.log('showTradeOfferPlayerBuyModal');
        let msg = ''
        const fleetName = coloredName(this.fleet)
        const ct = this.fleet.cargo.randomItem(false)
        const availableCargoSpace = gs.fleet.availableCargoSpace
        let onBuy = null;

        msg += `The ${fleetName} proudly display their wares.<br/>`
        if (!ct || this.fleet.cargo.getAmount(ct) <= 0) {
            msg += `Unfortunately, they have nothing of interest to sell you.<br/>`
        }
        else if (availableCargoSpace <= 0) {
            msg += `However, your cargo bays are full and you have no room to take any more goods.<br/>`
        }
        else {
            const maxBuyAmount = Math.min(this.fleet.cargo.getAmount(ct), availableCargoSpace)
            const buyAmount = rng(maxBuyAmount, 1)
            const pricePerUnit = Math.ceil(ct.value * rng(1.5, 0.75, false))
            const totalPrice = pricePerUnit * buyAmount
            msg += `They offer to sell you ${buyAmount} ${coloredName(ct)} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`

            if (gs.credits < totalPrice) {
                msg += `The ${fleetName} shake their heads pityingly upon realizing you cannot afford their offer.<br/>`
            }
            else {
                msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
                msg += `Your amount after purchase: ${gs.fleet.cargo.getAmount(ct) + buyAmount}<br/>`
                msg += `Your CR after purchase: ${gs.credits - totalPrice}CR.<br/>`

                onBuy = () => {
                    this.fleet.cargo.increment(ct, -buyAmount)
                    gs.fleet.cargo.increment(ct, buyAmount)
                    gs.credits -= totalPrice
                    showModal(fleetName, 
                        `You bought ${buyAmount} units of ${coloredName(ct)} for ${totalPrice}CR.<br/>
                        The merchants thank you and tell you to come again!<br/>`, [['Continue', ()=>this.endEncounter()]])
                }
            }
        }
        showModal(fleetName, msg, onBuy ? [
            ['Buy', ()=>onBuy()],
            ['Decline', ()=>this.endEncounter()] 
        ] :
        [['Continue', ()=>this.endEncounter()]])
    }
}