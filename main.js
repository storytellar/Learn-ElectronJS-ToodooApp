const electron = require('electron');
const url = require('url');
const path = require('path');
var fs = require("fs");

const { app, BrowserWindow, Menu, ipcMain } = electron;

// For official, un-comment the line below
process.env.NODE_ENV = 'production';

let mainWindow;

// Main window
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 450,
        title: 'Toodoo',
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: 'hiddenInset'
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/Main.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('close', () => app.quit());

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});


// Create a sub-window: New Task
function createNewTaskWindow() {
    NewTaskWindows = new BrowserWindow({
        width: 300,
        height: 220,
        title: 'New Task',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false
    });

    NewTaskWindows.loadURL(url.format({
        pathname: path.join(__dirname, 'views/NewTask.html'),
        protocol: 'file:',
        slashes: true
    }));

    NewTaskWindows.on('close', () => NewTaskWindows = null);
}

// Catch task:add
ipcMain.on('task:add', function (e, taskName, taskDate) {
    mainWindow.webContents.send('task:add', taskName, taskDate);
    NewTaskWindows.close();
    // ... code => UpdateNewTaskList();
});

// Catch task:cancel
ipcMain.on('task:cancel', () => {
    NewTaskWindows.close();
});

// Catch task:autosave
ipcMain.on('task:autosave', (e, data) => {
    fs.writeFile( path.join(__dirname, "data/tasks.txt"), data, (err) => {
        if (err) console.log(err);
    });
});

// Catch task:new (window)
ipcMain.on('task:new', () => {
    createNewTaskWindow();
});


// Main Menu
const mainMenuTemplate = [
    {
        label: 'default',
        submenu: [
            { label: 'Quit',accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q', click() {app.quit();}},
        ]
    },
    {
        label: 'Tasks',
        submenu: [
            { label: 'New', click(){ createNewTaskWindow();}, accelerator: "CmdOrCtrl+N" },
            { label: 'Clear all', click() {mainWindow.webContents.send('item:clear');}                }
        ],

    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
    }
];

// Mac OS: Main Menu
if (process.platform !== 'darwin') {
    mainMenuTemplate.unshift({});
}

// If this is a completed product => Hide Developer tools
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();

                }

            },
            {
                role: 'reload'
            },
        ]
    });
}