function showPlanetModal(planet = new Planet(), title = '', msg = '', options = [], modalId = '', onNavigate = (nextPlanet)=>{}) {
    // Create title with navigation arrows
    // Navigate within same planet type (dwarf or regular)
    const isDwarf = isDwarfPlanet(planet);
    const planetList = isDwarf ? gs.system.dwarfPlanets : gs.system.planets;
    const currentIndex = planetList.indexOf(planet);
    const prevPlanet = planetList[currentIndex - 1] || planetList[planetList.length - 1];
    const nextPlanet = planetList[currentIndex + 1] || planetList[0];
    
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