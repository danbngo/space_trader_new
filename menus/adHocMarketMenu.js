/**
 * Ad-hoc market menu for trading directly with merchant fleets.
 * Unlike settlement markets, this uses barter skill comparison and direct captain-to-captain transfers.
 */

/**
 * Show the ad-hoc market menu for trading with a merchant fleet
 * @param {Fleet} merchantFleet - The merchant fleet to trade with
 * @param {Function} onClose - Callback when the market closes
 */
function showAdHocMarketMenu(merchantFleet, onClose) {
    const fleetName = coloredName(merchantFleet);
    const playerCaptain = gs.fleet.captain;
    const merchantCaptain = merchantFleet.captain;
    
    // Calculate barter skill difference for pricing
    const playerBarter = playerCaptain.skills.getAmount(SKILLS.Barter) || 0;
    const merchantBarter = merchantCaptain.skills.getAmount(SKILLS.Barter) || 0;
    const barterDiff = playerBarter - merchantBarter;
    
    // Base price multipliers: better barter = better prices
    const buyMultiplier = 1.0 - (barterDiff * 0.04); // Each barter point is 4%
    const sellMultiplier = 0.8 + (barterDiff * 0.04);
    
    // Clamp multipliers to reasonable ranges
    const finalBuyMultiplier = Math.max(0.8, Math.min(1.2, buyMultiplier));
    const finalSellMultiplier = Math.max(0.6, Math.min(1.0, sellMultiplier));
    
    // Get all cargo types that either merchant or player has
    const allCargoTypes = new Set();
    for (const ct of merchantFleet.cargo.keys) allCargoTypes.add(ct);
    for (const ct of gs.fleet.cargo.keys) allCargoTypes.add(ct);
    
    // Sort cargo types alphabetically
    const cargoTypes = Array.from(allCargoTypes).sort((a, b) => a.name.localeCompare(b.name));
    
    let selectedCargoType = cargoTypes[0] || CARGO_TYPES_ALL[0];
    
    // Calculate prices for a cargo type
    function calcPrices(ct) {
        return {
            buyPrice: Math.ceil(ct.value * finalBuyMultiplier),
            sellPrice: Math.ceil(ct.value * finalSellMultiplier)
        };
    }
    
    // Buy cargo from merchant
    function buyCargo(ct, amount) {
        const { buyPrice } = calcPrices(ct);
        const totalCost = amount * buyPrice;
        
        merchantFleet.cargo.increment(ct, -amount);
        gs.fleet.cargo.increment(ct, amount);
        gs.credits -= totalCost;
        merchantCaptain.credits += totalCost;
        
        showAdHocMarketMenu(merchantFleet, onClose);
    }
    
    // Sell cargo to merchant
    function sellCargo(ct, amount) {
        const { sellPrice } = calcPrices(ct);
        const totalEarnings = amount * sellPrice;
        
        gs.fleet.cargo.increment(ct, -amount);
        merchantFleet.cargo.increment(ct, amount);
        gs.credits += totalEarnings;
        merchantCaptain.credits -= totalEarnings;
        
        showAdHocMarketMenu(merchantFleet, onClose);
    }
    
    // Show buy slider for selected cargo
    function showBuySlider(ct) {
        const { buyPrice } = calcPrices(ct);
        const merchantStock = merchantFleet.cargo.getAmount(ct);
        const playerCredits = gs.credits;
        const playerCargoSpace = gs.fleet.availableCargoSpace;
        const maxAffordable = Math.floor(playerCredits / buyPrice);
        const maxBuyable = Math.min(merchantStock, playerCargoSpace, maxAffordable);
        
        if (maxBuyable <= 0) {
            showModal('Cannot Buy', 
                `You cannot buy any ${ct.name}.<br/>
                ${playerCargoSpace <= 0 ? 'Your cargo hold is full.<br/>' : ''}
                ${maxAffordable <= 0 ? 'You cannot afford any.<br/>' : ''}
                ${merchantStock <= 0 ? 'Merchant has none in stock.<br/>' : ''}`,
                [['OK', () => showAdHocMarketMenu(merchantFleet, onClose)]]);
            return;
        }
        
        showSliderModal(
            1, maxBuyable, `Buy ${coloredName(ct)}`,
            `How many ${coloredName(ct)} would you like to buy?`,
            (amt) => `Price: ${amt * buyPrice}CR<br/>Credits After: ${playerCredits - (amt * buyPrice)}CR`,
            'Buy', 'Cancel',
            (amt) => buyCargo(ct, amt),
            () => showAdHocMarketMenu(merchantFleet, onClose)
        );
    }
    
    // Show sell slider for selected cargo
    function showSellSlider(ct) {
        const { sellPrice } = calcPrices(ct);
        const playerStock = gs.fleet.cargo.getAmount(ct);
        const merchantCredits = merchantCaptain.credits;
        const merchantCargoSpace = merchantFleet.availableCargoSpace;
        const maxMerchantCanAfford = Math.floor(merchantCredits / sellPrice);
        const maxSellable = Math.min(playerStock, merchantCargoSpace, maxMerchantCanAfford);
        
        if (maxSellable <= 0) {
            showModal('Cannot Sell', 
                `You cannot sell any ${ct.name}.<br/>
                ${playerStock <= 0 ? 'You have none.<br/>' : ''}
                ${merchantCargoSpace <= 0 ? 'Merchant cargo hold is full.<br/>' : ''}
                ${maxMerchantCanAfford <= 0 ? 'Merchant cannot afford any.<br/>' : ''}`,
                [['OK', () => showAdHocMarketMenu(merchantFleet, onClose)]]);
            return;
        }
        
        const credits = gs.credits;
        showSliderModal(
            1, maxSellable, `Sell ${coloredName(ct)}`,
            `How many ${coloredName(ct)} would you like to sell?`,
            (amt) => {
                const totalEarnings = amt * sellPrice;
                return `Earnings: ${totalEarnings}CR<br/>Credits After: ${credits + totalEarnings}CR`;
            },
            'Sell', 'Cancel',
            (amt) => sellCargo(ct, amt),
            () => showAdHocMarketMenu(merchantFleet, onClose)
        );
    }
    
    // Update button states based on selected cargo
    function updateButtons(ct) {
        selectedCargoType = ct;
        const { buyPrice, sellPrice } = calcPrices(ct);
        const merchantStock = merchantFleet.cargo.getAmount(ct);
        const playerStock = gs.fleet.cargo.getAmount(ct);
        const playerCredits = gs.credits;
        const playerCargoSpace = gs.fleet.availableCargoSpace;
        const merchantCredits = merchantCaptain.credits;
        const merchantCargoSpace = merchantFleet.availableCargoSpace;
        
        const maxAffordable = Math.floor(playerCredits / buyPrice);
        const maxBuyable = Math.min(merchantStock, playerCargoSpace, maxAffordable);
        const maxMerchantCanAfford = Math.floor(merchantCredits / sellPrice);
        const maxSellable = Math.min(playerStock, merchantCargoSpace, maxMerchantCanAfford);
        
        const canBuy = maxBuyable > 0;
        const canSell = maxSellable > 0;
        
        const buttons = [
            ['Buy', () => showBuySlider(ct), !canBuy],
            ['Sell', () => showSellSlider(ct), !canSell],
            ['Close', () => { if (onClose) onClose(); }]
        ];
        
        refreshPanelButtons('adhoc_market_panel', buttons);
    }
    
    // Build dropdown options
    const dropdownOptions = cargoTypes.map(ct => {
        const merchantStock = merchantFleet.cargo.getAmount(ct);
        const playerStock = gs.fleet.cargo.getAmount(ct);
        return [
            `${ct.symbol} ${coloredName(ct)} (M:${merchantStock} Y:${playerStock})`,
            () => updateButtons(ct),
            ct === selectedCargoType
        ];
    });
    
    const dropdown = new Dropdown(dropdownOptions, false, 0).container;
    
    // Build table
    const rows = [
        ['Cargo Type', 'Merchant Stock', 'Buy Price', 'Your Stock', 'Sell Price']
    ];
    
    for (const ct of cargoTypes) {
        const { buyPrice, sellPrice } = calcPrices(ct);
        const merchantStock = merchantFleet.cargo.getAmount(ct) || 0;
        const playerStock = gs.fleet.cargo.getAmount(ct) || 0;
        
        rows.push([
            `${ct.symbol} ${ct.name}`,
            ''+merchantStock,
            `${buyPrice}CR`,
            ''+playerStock,
            `${sellPrice}CR`
        ]);
    }
    
    const table = createTable(rows, (index) => {
        if (index >= 0 && index < cargoTypes.length) {
            updateButtons(cargoTypes[index]);
        }
    });
    
    const panel = createPanel();
    panel.classList.add('market-panel');
    
    const content = ce({ tag: 'div', children: [
        `<p>Trade freely with the merchant captain. Prices are based on barter skill.</p>`,
        dropdown,
        table,
        `<p>Your Cargo: ${gs.fleet.cargo.total}/${gs.fleet.totalCargoSpace} | Your Credits: ${gs.credits}CR</p>`,
        `<p>Merchant Credits: ${merchantCaptain.credits}CR | Merchant Cargo: ${merchantFleet.cargo.total}/${merchantFleet.totalCargoSpace}</p>`
    ]});
    
    panel.appendChild(content);
    
    showPanel(`Trading with ${fleetName}`, panel, []);
    
    // Initialize buttons for first cargo type
    if (cargoTypes.length > 0) {
        updateButtons(selectedCargoType);
    }
}
