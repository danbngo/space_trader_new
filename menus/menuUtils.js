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
                style: {
                    marginLeft: '10px', marginRight: '10px', marginTop: '0px'
                }
            }),
            ce({
                tag: 'div',
                style: {minWidth: '300px', textAlign: 'center'},
                children: [title]
            }),
            ce({
                tag: 'button',
                innerHTML: '▶',
                onClick: () => onNavigate(nextPlanet),
                style: {
                    marginLeft: '10px', marginRight: '10px', marginTop: '0px'
                }
            })
        ]
    });

    const modal = showModal(titleEl, msg, options, modalId, ()=>closeModal());
    modal.firstChild.style.minWidth = '90vw'
}