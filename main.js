const electron = require('electron');
const url = require('url');
const path = require('path');


const {app, BrowserWindow, Menu, ipcMain} = electron;

// For official, un-comment the line below
// process.env.NODE_ENV = 'production';

let mainWindow;

app.on('ready',function(){
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

    mainWindow.on('close',()=>app.quit());

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
});

function createNewTaskWindow(){
    NewTaskWindows = new BrowserWindow({
        width: 300,
        height: 250,
        title: 'New Task',
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: 'hiddenInset'
        //frame: false
    });

    NewTaskWindows.loadURL(url.format({
        pathname: path.join(__dirname, 'views/NewTask.html'),
        protocol: 'file:',
        slashes: true
    }));

    NewTaskWindows.on('close',()=>NewTaskWindows=null);
}

// Catch task:add
ipcMain.on('task:add',function(e,taskName,taskDate){
    mainWindow.webContents.send('task:add', taskName, taskDate);
    NewTaskWindows.close();
    // ... code => UpdateNewTaskList();
});
// Catch task:new
ipcMain.on('task:new',()=>{
    createNewTaskWindow();
});


// Main Menu
const mainMenuTemplate = [
    {
        label: 'default',
        submenu: [
            {
                label : 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            },
        ]
    },
    {
        label: 'Item Manager',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createNewTaskWindow();
                },
            },
            {
                label: 'Clear Item',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            }
        ],

    }
];




if(process.platform!=='darwin'){
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                    
                }
                
            },
            {
                role: 'reload'
            },
        ]
    });
}