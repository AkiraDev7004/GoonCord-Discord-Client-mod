/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { join } from "path";

import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import { IpcEvents, UpdaterIpcEvents } from "shared/IpcEvents";
import { Millis } from "shared/utils/millis";

import { PORTABLE } from "./constants";
import { State } from "./settings";
import { handle } from "./utils/ipcWrappers";
import { makeLinksOpenExternally } from "./utils/makeLinksOpenExternally";
import { showWindow } from "./utils/showWindow";
import { loadView } from "./vesktopStatic";

let updaterWindow: BrowserWindow | null = null;

// The newest release of this app, or null. Filled by the background check and only read by the renderer,
// so the renderer never causes an extra request to GitHub.
let availableUpdate: UpdateInfo | null = null;

autoUpdater.on("update-downloaded", () => setTimeout(() => autoUpdater.quitAndInstall(), 100));
autoUpdater.on("download-progress", p =>
    updaterWindow?.webContents.send(UpdaterIpcEvents.DOWNLOAD_PROGRESS, p.percent)
);
autoUpdater.on("error", err => updaterWindow?.webContents.send(UpdaterIpcEvents.ERROR, err.message));

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.fullChangelog = true;

// The banner is hidden when the user chose to ignore this version or snoozed the updates
function isUpdateVisible(update: UpdateInfo) {
    if (State.store.updater?.ignoredVersion === update.version) return false;
    return (State.store.updater?.snoozeUntil ?? 0) <= Date.now();
}

async function checkForGoonUpdate(): Promise<UpdateInfo | null> {
    if (!app.isPackaged) return null;

    try {
        const res = await autoUpdater.checkForUpdates();
        availableUpdate = res?.isUpdateAvailable && res.updateInfo ? res.updateInfo : null;
    } catch {
        // Offline or GitHub not reachable: keep the last known result
    }
    return availableUpdate;
}

// Checked shortly after start and then every 2 minutes
const UPDATE_CHECK_INTERVAL = 2 * Millis.MINUTE;
app.whenReady().then(() => {
    setTimeout(() => void checkForGoonUpdate(), 10_000);
    setInterval(() => void checkForGoonUpdate(), UPDATE_CHECK_INTERVAL);
});

// Answers from the cached result; no request is made here
handle(IpcEvents.UPDATER_IS_OUTDATED, () => availableUpdate !== null && isUpdateVisible(availableUpdate));

handle(IpcEvents.UPDATER_OPEN, async () => {
    const update = (await checkForGoonUpdate()) ?? availableUpdate;
    if (update) openUpdater(update);
});

function openUpdater(update: UpdateInfo) {
    if (updaterWindow) {
        showWindow(updaterWindow);
        return;
    }

    updaterWindow = new BrowserWindow({
        title: "GoonCord Updater",
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, "updaterPreload.js")
        },
        minHeight: 400,
        minWidth: 750
    });
    makeLinksOpenExternally(updaterWindow);

    handle(UpdaterIpcEvents.GET_DATA, () => ({ update, version: app.getVersion(), portable: PORTABLE }));
    handle(UpdaterIpcEvents.INSTALL, async () => {
        await autoUpdater.downloadUpdate();
    });
    handle(UpdaterIpcEvents.SNOOZE_UPDATE, () => {
        State.store.updater ??= {};
        State.store.updater.snoozeUntil = Date.now() + 1 * Millis.DAY;
        updaterWindow?.close();
    });
    handle(UpdaterIpcEvents.IGNORE_UPDATE, () => {
        State.store.updater ??= {};
        State.store.updater.ignoredVersion = update.version;
        updaterWindow?.close();
    });

    updaterWindow.on("closed", () => {
        ipcMain.removeHandler(UpdaterIpcEvents.GET_DATA);
        ipcMain.removeHandler(UpdaterIpcEvents.INSTALL);
        ipcMain.removeHandler(UpdaterIpcEvents.SNOOZE_UPDATE);
        ipcMain.removeHandler(UpdaterIpcEvents.IGNORE_UPDATE);
        updaterWindow = null;
    });

    loadView(updaterWindow, "updater/index.html");
}
