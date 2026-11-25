/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/*
 * GoonCord update banner. Every 2 minutes it asks the main process whether a newer version exists,
 * and shows a bar at the bottom of the window. "Jetzt updaten" opens the updater, which installs
 * the new version in place, so GoonCord does not have to be uninstalled first.
 */

const BANNER_ID = "goon-update-banner";
const CHECK_INTERVAL = 2 * 60 * 1000;

let dismissed = false;

function showBanner() {
    if (document.getElementById(BANNER_ID)) return;

    const bar = document.createElement("div");
    bar.id = BANNER_ID;
    Object.assign(bar.style, {
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "99999",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 16px",
        background: "#111214",
        color: "#ffffff",
        borderTop: "2px solid #5865f2",
        fontFamily: "sans-serif",
        fontSize: "14px"
    });

    const text = document.createElement("span");
    text.textContent = "Eine neue Version von GoonCord ist verfügbar.";

    const actions = document.createElement("div");
    Object.assign(actions.style, { display: "flex", gap: "8px" });

    const update = document.createElement("button");
    update.textContent = "Jetzt updaten";
    Object.assign(update.style, {
        background: "#5865f2",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        padding: "6px 12px",
        cursor: "pointer"
    });
    update.onclick = () => {
        VesktopNative.app.openUpdater().catch(err => console.error("GoonCord: could not open updater", err));
    };

    const later = document.createElement("button");
    later.textContent = "Später";
    Object.assign(later.style, {
        background: "transparent",
        color: "#b5bac1",
        border: "1px solid #4e5058",
        borderRadius: "4px",
        padding: "6px 12px",
        cursor: "pointer"
    });
    later.onclick = () => {
        dismissed = true;
        hideBanner();
    };

    actions.append(update, later);
    bar.append(text, actions);
    (document.body ?? document.documentElement).appendChild(bar);
}

function hideBanner() {
    document.getElementById(BANNER_ID)?.remove();
}

async function check() {
    if (dismissed) return;
    try {
        if (await VesktopNative.app.isOutdated()) showBanner();
        else hideBanner();
    } catch (err) {
        console.error("GoonCord: update check failed", err);
    }
}

function start() {
    setTimeout(check, 15_000);
    setInterval(check, CHECK_INTERVAL);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}

export {};
