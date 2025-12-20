async function start() {
    await document.fonts.load('20px "Google Sans Code"');
    await document.fonts.load('italic 20px "Google Sans Code"');
    showTitleScreen()
}

start()