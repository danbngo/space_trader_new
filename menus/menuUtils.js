function showPlanetModal(planet = new Planet(), title = '', msg = '', options = [], modalId = '', onNavigate = (nextPlanet)=>{}) {
    // Create title with navigation arrows
    const currentIndex = gs.system.planets.indexOf(planet);
    const prevPlanet = gs.system.planets[currentIndex - 1] || gs.system.planets[gs.system.planets.length - 1];
    const nextPlanet = gs.system.planets[currentIndex + 1] || gs.system.planets[0];
    
    const titleEl = ce({
        style: {
            display: 'flex',
            gap: '10px',
            flexAlign: 'center',
            justifyContent: 'center',
        },
        children: [
            ce({
                tag: 'button',
                innerHTML: '◀',
                onClick: () => onNavigate(prevPlanet),
                style: 'margin-right: 10px; cursor: pointer;'
            }),
            ce({
                tag: 'div',
                style: {minWidth: '150px', flex: '1 1 auto', textAlign: 'center'},
                children: [coloredName(planet)]
            }),
            ce({
                tag: 'button',
                innerHTML: '▶',
                onClick: () => onNavigate(nextPlanet),
                style: 'margin-left: 10px; cursor: pointer;'
            })
        ]
    });

    const modal = showModal(titleEl, msg, options, modalId);
    modal.firstChild.style.minWidth = '90vw'
}