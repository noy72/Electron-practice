const {app, BrowserWindow} = require('electron');

let mainWindow = null;

app.on('ready', () => {
    console.log("hello world");
    mainWindow = new BrowserWindow();
    mainWindow.webContents.loadFile('./app/index.html');
});