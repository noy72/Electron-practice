const {app, BrowserWindow, dialog, Menu} = require('electron');
const applicationMenu = require('./application-menu');
const fs = require('fs');


const windows = new Set();
const openFiles = new Map();


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
        stopWatchingFile(newWindow);
        newWindow = null;
    });

    newWindow.on('close', (event) => {
        if (newWindow.isDocumentEdited()) {
            event.preventDefault();
            const result = dialog.showMessageBoxSync(newWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes?',
                message: 'Your changes will be lost if you do not save.',
                buttons: [
                    'Quit Anyway',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1
            });
            if (result === 0) newWindow.destroy();
        }
    });

    windows.add(newWindow);
    return newWindow;
};

app.on('ready', () => {
    createWindow();
    Menu.setApplicationMenu(applicationMenu);
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

app.on('will-finish-launching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            openFile(win, file);
        });
    });
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
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
};

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    const file = dialog.showSaveDialogSync(targetWindow, {
        title: 'Save HTML',
        defaultPath: app.getPath('documents'),
        filters: [
            {name: 'HTML Files', extensions: ['html', 'htm']}
        ]
    });

    if (!file) return;

    fs.writeFileSync(file, content);
};

const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
    if (!file) {
        file = dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [
                {name: 'Markdown Files', extensions: ['md', 'markdown']}
            ]
        });
    }
    if (!file) return;
    fs.writeFileSync(file, content);
    openFile(targetWindow, file);
};

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);
    const watcher = fs.watch(file, (event) => {
        if (event === 'change') {
            const content = fs.readFileSync(file);
            targetWindow.webContents.send('file-changed', file, content);
        }
    });
    openFiles.set(targetWindow, watcher);
};

const stopWatchingFile = (targetWindow) => {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
    }
};
