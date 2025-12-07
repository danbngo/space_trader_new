// Space Game Logic

// Creates a UI panel with title, text, and buttons

const UI_CONTAINER = document.getElementById("game-container");


function removeChildren(parent = createElement()) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
}

function refreshPanelButtons (panelId = '', buttons = []) {
    const panel = panelId instanceof HTMLElement ? panelId : document.body.querySelector(`#${panelId}`)
    const buttonsEl = panel.querySelector(".panel-buttons")
    removeChildren(buttonsEl)
    buttons.forEach((btnData) => {
        if (!btnData) return
        const [label, handler, disabled] = btnData
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.onclick = handler;
        buttonsEl.appendChild(btn);
        if (disabled) {console.log('gonna disable a btn:',btn); btn.disabled = true}
    });
}

function createPanel(title = '', text = '', buttons = [['Continue', ()=>{}, false]], id = '') {
    const panel = createElement({
        id,
        classNames: ['panel'],
        children: [
            createElement({classNames:['panel-title'], innerHTML: title}),
            text,
            createElement({classNames:['panel-buttons']})
        ]
    })
    refreshPanelButtons(panel, buttons)
    return panel;
}

function showPanel(title = '', text = '', buttons = ['Continue', ()=>{}], id = '') {
    const panel = createPanel(title, text, buttons, id);
    showElement(panel)
    return panel
}

function showElement(element = createElement()) {
    UI_CONTAINER.innerHTML = "";
    UI_CONTAINER.appendChild(element);
}

let currentMap;

function showMap(map = new StarMap()) {
    currentMap = map
    showElement(map.root)
}

function statColorSpan(text = '', ratio = 1.0) {
    // clamp ratio so interpolation works cleanly
    const r = Math.max(0, Math.min(ratio, 4.0));
    // helper: linear interpolation between two hex colors
    function lerpColor(a, b, t) {
        const ar = parseInt(a.slice(1, 3), 16);
        const ag = parseInt(a.slice(3, 5), 16);
        const ab = parseInt(a.slice(5, 7), 16);
        const br = parseInt(b.slice(1, 3), 16);
        const bg = parseInt(b.slice(3, 5), 16);
        const bb = parseInt(b.slice(5, 7), 16);
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr}, ${rg}, ${rb})`;
    }
    // segments (minRatio, maxRatio, colorA, colorB)
    const segments = [
        [0.0, 0.5,   "#ff0000", "#ff8000"], // red → orange
        [0.5, 0.75,  "#ff8000", "#ffff00"], // orange → yellow
        [0.75,1.0,   "#ffff00", "#ffffff"], // yellow → white
        [1.0, 4.0,   "#ffffff", "#00ff00"], // white → green
    ];
    let color = "#00ffff"; // fallback for ratio ≥ 4.0
    for (let [minR, maxR, cA, cB] of segments) {
        if (r >= minR && r <= maxR) {
            const t = (r - minR) / (maxR - minR);
            color = lerpColor(cA, cB, t);
            break;
        }
    }
    return colorSpan(text, color, false)
}

function colorSpan(text = '', color = '', asHtmlText = true) {
    if (asHtmlText) {
        // return HTML string instead of DOM element
        return `<span style="color: ${color}">${text}</span>`;
    }

    // return DOM element normally
    const span = document.createElement("span");
    span.style.color = color;
    span.textContent = text;
    return span;
}

function createElement({tag = 'div', id = '', innerHTML = '', children = [], parent = undefined, classNames = [], onClick, style = {}, disabled = false} = {}) {
    id = id || ''
    tag = tag || 'div'
    children = children || []
    classNames = classNames || []
    style = style || {}
    if (onClick) style.cursor = 'pointer'
    if (disabled) style.cursor = ''

    const el = document.createElement(tag)
    if (innerHTML !== undefined) el.innerHTML = ''+innerHTML
    if (id && id.length > 0) el.id = ''+id
    if (children && children.length > 0) for (const child of children) if (child !== undefined && child !== null) el.appendChild(child instanceof HTMLElement ? child : createElement({innerHTML: child}))
    if (parent) parent.appendChild(el)
    if (classNames && classNames.length > 0) for (const className of classNames) el.classList.add(className)
    if (onClick) el.onclick = onClick
    if (style) applyStyle(el, style)
    if (disabled) el.disabled = true
    return el
}

function applyStyle(element, style = {}) {
    for (const key in style) {
        element.style[key] = style[key]
    }
}

// utils.js or tableUtil.js
function createTable(rows = [createElement()], onSelectRow = (index = 0)=>{}) {
    const table = document.createElement("table");
    table.className = "ui-table";

    // Determine column count (future proof: if rows become arrays)
    const colCount = Math.max(
        ...rows.map(row => Array.isArray(row) ? row.length : 1)
    );

    let selectedRow = undefined
    rows.forEach((row, index) => {
        const onRowClicked = ()=>{
            if (selectedRow) selectedRow.classList.remove('selected')
            tr.classList.add('selected')
            selectedRow = tr
            onSelectRow(index-1); //-1 for header
        }

        const tr = createElement({
            parent: table,
            tag:'tr',
            classNames: [index == 0 ? 'ui-table-first-row' : 'ui-table-row'],
            onClick: (index == 0 ? undefined : onRowClicked)
        })

        for (let i = 0; i < colCount; i++) {
            createElement({
                parent: tr,
                tag:index == 0 ? 'th' : 'td',
                classNames:['ui-table-cell'],
                children: [row[i]],
                onClick: (index == 0 ? undefined : onRowClicked)
            })
        }
    });

    return table;
}

let currentModal = createElement()

function showModal(title = '', text = '', buttons = [['Continue', ()=>{}, false]], id = '') {
    // Close existing modal if open
    if (currentModal) closeModal();
    // Create overlay
    currentModal = createElement({parent:UI_CONTAINER, classNames:['modal-overlay'], children:[
        createPanel(title, text, buttons, id)
    ]})
    return currentModal
}

function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}

function attachDragHandler(element = createElement(), callback = (dx=0,dy=0)=>{}) {
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    element.addEventListener("mousedown", (ev) => {
        if (ev.button !== 0) return; // left mouse only

        isDown = true;
        lastX = ev.clientX;
        lastY = ev.clientY;

        function onMouseMove(moveEv) {
            if (!isDown) return;

            const dx = moveEv.clientX - lastX;
            const dy = moveEv.clientY - lastY;

            // Update last position for next delta
            lastX = moveEv.clientX;
            lastY = moveEv.clientY;

            callback(dx,dy);
        }

        function onMouseUp() {
            isDown = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}


function attachMouseWheelHandler(element = createElement(), callback = (direction = 1)=>{}) {
    if (!element || typeof callback !== "function") return;

    const handler = (event) => {
        event.preventDefault();

        // Standard: wheelDeltaY or deltaY
        let delta = event.deltaY || event.wheelDelta || (-event.detail);

        // Normalize to +1 / -1
        const direction = delta < 0 ? 1 : -1;

        callback(direction, event);
    };

    // Modern browsers
    element.addEventListener("wheel", handler, { passive: false });

    // Older WebKit/IE
    element.addEventListener("mousewheel", handler, { passive: false });

    // Older Firefox
    element.addEventListener("DOMMouseScroll", handler, { passive: false });
}

