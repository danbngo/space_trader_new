const uiKeysPressed = {};

window.addEventListener("keydown", (e) => {
    uiKeysPressed[e.key.toLowerCase()] = true;
    console.log('keys pressed:',uiKeysPressed)
});

window.addEventListener("keyup", (e) => {
    //uiKeysPressed[e.key.toLowerCase()] = false;
    delete uiKeysPressed[e.key.toLowerCase()]
    console.log('keys pressed:',uiKeysPressed)
});