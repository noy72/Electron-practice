const {app, dialog, Menu, MenuItem, shell, BrowserWindow} = require('electron');
const mainProcess = require('./main');

const createApplicationMenu = () => {
    const hasOneOrMoreWindows = !!BrowserWindow.getAllWindows().length;
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const hasFilePath = !!(focusedWindow &&
        focusedWindow.getRepresentedFilename());

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CommandOrControl+N',
                    click() {
                        mainProcess.createWindow();
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CommandOrControl+O',
                    click(item, focusedWindow) {
                        if (focusedWindow) {
                            return mainProcess.getFileFromUser(focusedWindow);
                        }

                        const newWindow = mainProcess.createWindow();
                        newWindow.on('show', () => {
                            mainProcess.getFileFromUser(newWindow);
                        });
                    },
                },
                {
                    label: 'Save File',
                    enabled: hasOneOrMoreWindows,
                    accelerator: 'CommandOrControl+S',
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Save or Export',
                                'There is currently no active document to save or export.'
                            );
                        }
                    }
                },
                {

                    label: 'Export HTML',
                    enabled: hasOneOrMoreWindows,
                    accelerator: 'Shift+CommandOrControl+S',
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Save or Export',
                                'There is currently no active document to save or export.');
                        }
                        focusedWindow.webContents.send('save-html');
                    },
                },
                {type: 'separator'},
                {
                    label: 'Show File',
                    enabled: hasFilePath,
                    accelerator: 'Shift+CommandOrControl+S',
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Show File\'s Location',
                                'There is currently no active document show.'
                            );
                        }
                        focusedWindow.webContents.send('show-file');
                    },
                },
                {
                    label: 'Open in Default Editor',
                    enabled: hasFilePath,
                    accelerator: 'Shift+CommandOrControl+S',
                    click(item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Open File in Default Editor',
                                'There is currently no active document to open.'
                            );
                        }
                        focusedWindow.webContents.send('open-in-default');
                    }
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CommandOrControl+Z',
                    role: 'undo',
                },
                {

                    label: 'Redo',
                    accelerator: 'Shift+CommandOrControl+Z',
                    role: 'redo',
                },
                {type: 'separator'},
                {
                    label: 'Cut',
                    accelerator: 'CommandOrControl+X',
                    role: 'cut',
                },
                {
                    label: 'Copy',
                    accelerator: 'CommandOrControl+C',
                    role: 'copy',
                },
                {

                    label: 'Paste',
                    accelerator: 'CommandOrControl+V',
                    role: 'paste',
                },
                {
                    label: 'Select All',
                    accelerator: 'CommandOrControl+A',
                    role: 'selectall',
                },
            ],
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CommandOrControl+M',
                    role: 'minimize',
                },
                {
                    label: 'Close',
                    accelerator: 'CommandOrControl+W',
                    role: 'close',
                },
            ],
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Visit Website',
                    click() { /* To be implemented */
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    click(item, focusedWindow) {
                        if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        const name = app.getName();
        template.unshift({label: name});
    }

    if (process.platform === 'darwin') {
        const name = app.getName();
        template.unshift(
            {
                label: name,
                submenu: [
                    {
                        label: `About ${name}`,
                        role: 'about',
                    },
                    {type: 'separator'},
                    {
                        label: 'Services',
                        role: 'services',
                        submenu: [],
                    },
                    {type: 'separator'},
                    {
                        label: `Hide ${name}`,
                        accelerator: 'Command+H',
                        role: 'hide',
                    },
                    {
                        label: 'Hide Others',
                        accelerator: 'Command+Alt+H',
                        role: 'hideothers',
                    },
                    {
                        role: 'unhide',
                    },
                    {type: 'separator'},
                    {
                        label: `Quit ${name}`,
                        accelerator: 'Command+Q', click() {
                            app.quit();
                        },
                    },
                ],
            }
        );
        const windowMenu = template.find(item => item.label === 'Window');
        windowMenu.role = 'window';
        windowMenu.submenu.push(
            {type: 'separator'},
            {
                label: 'Bring All to Front',
                role: 'front',
            }
        );
    }
    return Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};


module.exports = createApplicationMenu;
