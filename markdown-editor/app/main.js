const {app, BrowserWindow, dialog} = require('electron');
const fs = require('fs');


const windows = new Set();

const createWindow = exports.createWindow = () => {
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();

    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }

    let newWindow = new BrowserWindow({
            x, y,
            show: false,
            webPreferences: {
                nodeIntegration: true,
            },
        }
    );

    newWindow.loadFile('app/index.html').then(() => {
    });
    newWindow.once('ready-to-show', () => {
            newWindow.show();
            newWindow.webContents.openDevTools();
        }
    );
    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    windows.add(newWindow);
    return newWindow;
};

app.on('ready', () => {
    createWindow();
    /*
    mainWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
            },
        }
    );
    mainWindow.loadFile('app/index.html');
    mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            mainWindow.webContents.openDevTools();
            getFileFromUser();
        }
    );
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    */
});

app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
        return false;
    }
    app.quit();
});

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
        createWindow();
    }
});

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialogSync(targetWindow, {
        properties: ['openFile'],
        filters: [
            {name: 'Text Files', extensions: ['txt']},
            {name: 'Markdown Files', extensions: ['md', 'markdown']}
        ]
    });

    if (files) {
        openFile(targetWindow, files[0]);
    }
};

const openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened', file, content);
};
