

function showGuildMenu(planet = new Planet()) {
    const options = [];
    const {fleet, captain} = gameState
    const {guild} = planet.settlement

    // Purchase officers from the guild
    guild.officers.forEach((officer, index) => {
        options.push([`Hire ${officer.name}`, () => {
            fleet.officers.push(officer);
            guild.officers.splice(index, 1);
            saveGameState();
            showGuildMenu(planet); // refresh menu
        }]);
    });

    // Release player's officers (cannot release captain)
    fleet.officers.forEach((officer, index) => {
        if (officer !== fleet.captain) {
            options.push([`Release ${officer.name}`, () => {
                guild.officers.push(officer);
                fleet.officers.splice(index, 1);
                saveGameState();
                showGuildMenu(planet); // refresh menu
            }]);
        }
    });

    // Back button
    options.push(["Back", () => showPlanetMenu(planet)]);

    showPanel(
        `${coloredName(planet)} - Guild`,
        `Manage your officers:\nCaptain: ${fleet.captain.name}`,
        options
    );
}