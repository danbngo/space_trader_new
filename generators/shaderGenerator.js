
function createContinentsShader() {
    let continents = null;
    
    return (ctx, size) => {
        if (!continents) {
            continents = [];
            const count = 6 + Math.floor(Math.random() * 5);
            
            for (let i = 0; i < count; i++) {
                continents.push({
                    nx: (Math.random() * 2 - 1) * 0.6,
                    ny: (Math.random() * 2 - 1) * 0.6,
                    nr: 0.2 + Math.random() * 0.25
                });
            }
        }
        
        //ctx.clip();
        
        // ocean
        ctx.fillStyle = "#1e4fa1";
        ctx.fillRect(-size, -size, size * 2, size * 2);
        
        // land
        ctx.fillStyle = "#3fa34d";
        ctx.beginPath();
        for (const c of continents) {
            ctx.moveTo(c.nx * size + c.nr * size, c.ny * size);
            ctx.arc(
                c.nx * size,
                c.ny * size,
                c.nr * size,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    };
}


function createGasShader() {
    let bands = null;
    const bandHeight = 0.2;
    
    return (ctx, size) => {
        if (!bands) {
            bands = [];
            
            for (let y = -1; y < 1; y += bandHeight) {
                bands.push({
                    ny: y,
                    hue: 25 + Math.random() * 20,
                    lightness: 45 + Math.random() * 15
                });
            }
        }
        
        //ctx.clip();
        
        for (const b of bands) {
            ctx.fillStyle = `hsl(${b.hue}, 55%, ${b.lightness}%)`;
            ctx.fillRect(
                -size,
                b.ny * size,
                size * 2,
                bandHeight * size
            );
        }
    };
}

function createIceShader() {
    let speckle = null;
    
    return (ctx, size) => {
        if (!speckle) {
            speckle = [];
            const count = 50;
            
            for (let i = 0; i < count; i++) {
                speckle.push({
                    nx: (Math.random() * 2 - 1),
                    ny: (Math.random() * 2 - 1),
                    nr: 0.12 + Math.random() * 0.08,
                    a: 0.05 + Math.random() * 0.05
                });
            }
        }
        
        //ctx.clip();
        
        ctx.fillStyle = "#a8d8ff";
        ctx.fillRect(-size, -size, size * 2, size * 2);
        
        for (const s of speckle) {
            ctx.beginPath();
            ctx.arc(
                s.nx * size,
                s.ny * size,
                s.nr * size,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `rgba(255,255,255,${s.a})`;
            ctx.fill();
        }
    };
}


function createSpotsShader(r = 0, g = 0, b = 0, count = 2000, maxSize = 0.5) {
    let sunspots = null;
    
    return (ctx, size) => {
        if (!sunspots) {
            sunspots = [];
            for (let i = 0; i < count; i++) {
                //const r = Math.floor(64 + Math.random() * 192);
                //const g = Math.floor(r*0.5*Math.pow(Math.random(), 1/2));
                //const b = Math.floor(g*Math.pow(Math.random(), 1/2));
                const opacity = 0.05 + Math.random() * 0.20;
                const br = 0.5 + Math.random() * 0.7;
                sunspots.push({
                    nx: (Math.random() * 2 - 1), // normalized
                    ny: (Math.random() * 2 - 1),
                    nr: (Math.random() * maxSize) * ((count-i)/count),  // radius fraction
                    fillStyle: `rgba(${Math.round(r*br)},${Math.round(g*br)},${Math.round(b*br)},${opacity})`
                });
            }
        }
        
        const renderCount = 1//Math.floor(count * Math.min(1, Math.pow(size / 100, 2)));
        //console.log('sunspots:',sunspots,'render count:',renderCount)
        for (let i = 0; i < renderCount; i++) {
            const s = sunspots[i]
            ctx.beginPath();
            ctx.arc(
                s.nx * size,
                s.ny * size,
                s.nr * size,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = s.fillStyle;
            ctx.fill();
        }
        
    };
}
