import { execSync } from 'child_process';
import env from 'dotenv';
import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from 'electron';
import { join } from 'path';

import boot from './functions/boot';
import { deviceName, platform, version } from './functions/system';

env.config();

let win: BrowserWindow; let tray; let splash: BrowserWindow;

const trayIcon = join(__dirname, '/logo-white.png');

function splashWindow() {
	splash = new BrowserWindow({
		width: 600,
		height: 300,
		frame: false,
		center: true,
		icon: trayIcon,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
		},
	});
	splash.loadURL('https://dev.nomercy.tv/splash.html');

	splash.on('ready-to-show', () => {
		splash.focus();
		splash.show();
	});
}

function mainWindow() {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	win = new BrowserWindow({
		show: false,
		title: 'NoMercy MediaServer',
		width: width - 100,
		height: height - 100,
		minWidth: 1280,
		minHeight: 720,
		resizable: true,
		maximizable: true,
		roundedCorners: true,
		center: true,
		icon: trayIcon,
		webPreferences: {
			nodeIntegration: true,
			autoplayPolicy: 'no-user-gesture-required',
			contextIsolation: false,
			preload: join(__dirname, 'preload.js'),
			webgl: true,
		},
	});

	ipcMain.handle('get-displays', () => {
		return screen.getAllDisplays();
	});

	const brand = '';
	const model = '';

	win.loadURL('https://dev.nomercy.tv', {
		userAgent: `${platform.toTitleCase()} ${version}; NoMercy TV; ${deviceName}; ${brand}; ${model}`,
	});

	win.on('closed', () => {
		//
	});

	win.on('ready-to-show', () => {
		splash.destroy();
		win.focus();
		win.show();
	});

	win.on('close', (event) => {
		// @ts-ignore-next-line
		if (!app.isQuiting) {
			event.preventDefault();
			win.hide();
		}
		return false;
	});

	app.on('browser-window-created', (e, window) => {
		window.setMenu(null);
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
}

function trayMenu() {
	const trayMenu = Menu.buildFromTemplate([
		{
			label: 'Show App',
			click: function () {
				win.show();
			},
		},
		{
			label: 'Quit',
			click: function () {
				// @ts-ignore-next-line
				app.isQuiting = true;
				app.quit();
			},
		},
	]);
	tray = new Tray(trayIcon);
	tray.setContextMenu(trayMenu);
	tray.setToolTip('NoMercy Media Server');

	tray.on('click', () => {
		win.show();
	});
}

function createApp() {
	splashWindow();

	const gotTheLock = app.requestSingleInstanceLock();

	if (gotTheLock) {
		app.on('second-instance', () => {
			if (win) {
				if (win.isMinimized()) win.restore();
				win.focus();
			}
		});

		app.on('activate', () => {
			BrowserWindow.getAllWindows().map(win => win.show());
		});
	} else {
		app.quit();
	}

	execSync('yarn');

	boot().then(() => {
		mainWindow();
		trayMenu();
	});

}

try {
	app.whenReady().then(() => {
		createApp();
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) {
			createApp();
		}
	});
} catch (error) {
	(async () => {
		await boot();
	})();
}
