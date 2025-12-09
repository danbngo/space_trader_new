function createOfficerBuyMenu(officers = [new Officer()], guild = new Guild(), onSelectOfficer = (officer = new Officer())=>{}) {
    if (officers.length == 0) return `(None)`
    const rows = [
        ['Officer Name', ...SKILLS_ALL, 'Buy Price']
    ]
    for (const officer of officers) {
        const buyPrice = guild.calcBuyPrice(officer)
        rows.push([
            officer.name,
            ...SKILLS_ALL.map(sk=>officer.skills.getAmount(sk)),
            statColorSpan(buyPrice, officer.value/buyPrice)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

function showGuildBuyMenu(planet) {
    console.log('displaying guild menu:',planet,gameState)
    const {guild} = planet.settlement
    const {fleet, captain} = gameState
    const isDocked = fleet.location == planet

    function buyOfficer(officer = new Officer()) {
        const buyPrice = guild.calcBuyPrice(officer)
        gameState.captain.credits -= buyPrice;
        //guild.credits += buyPrice;
        fleet.officers.push(officer);
        guild.officers.splice(index, 1);
        showGuildBuyMenu(planet); // refresh menu
    }
    
    function onSelectGuildOfficer(officer = new Officer()) {
        if (!isDocked) return
        const buyPrice = guild.calcBuyPrice(officer)
        const buttons = [
            [`Buy ${officer.name}`, ()=>buyOfficer(officer), (captain.credits < buyPrice)],
            ["Back", () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('guild_buy_panel', buttons)
    }

    showModal(
        `${coloredName(planet.name)} - Guild`,
        createElement({children:[
            `Guild officers`,
            createBuyOfficerMenu(guild.officers, guild, (officer)=>onSelectGuildOfficer(officer)),
            `Your # officers: ${fleet.officers.length}`,
            `Your credits: ${captain.credits}`,
            //`Guild credits: ${guild.credits}`,
            `Buy Penalty: ${round(100*guild.rake, 2)}%`,
            `Local Officer Quality: ${round(100*guild.planet.culture.officerQuality, 2)}%`,
        ]}),
        [
            ["Sell Officers", ()=>showGuildSellMenu(planet)],
            ["Back", () => showPlanetMenu(planet)],
        ],
        `guild_buy_panel`,
    );
}
