/*
 * GoonCord, a Discord client based on Vesktop
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Default theme: OLED Black. Injected at startup, dark mode only.
 */

const STYLE_ID = "goon-oled-black";

const OLED_CSS = `
.theme-dark {
    --background-base-lowest: #000000;
    --background-base-low: #000000;
    --background-base-lower: #000000;
    --background-primary: #000000;
    --background-secondary: #050505;
    --background-secondary-alt: #050505;
    --background-tertiary: #0a0a0a;
    --background-floating: #0a0a0a;
    --background-surface-high: #0a0a0a;
    --background-surface-higher: #0f0f0f;
    --background-mod-subtle: #0a0a0a;
    --chat-background-default: #000000;
    --channeltextarea-background: #0a0a0a;
}
body, .theme-dark body {
    background-color: #000000 !important;
}
`;

function applyOledBlack() {
    try {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = OLED_CSS;
        (document.head ?? document.documentElement).appendChild(style);
    } catch (err) {
        console.error("GoonCord: failed to apply OLED Black theme", err);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyOledBlack, { once: true });
} else {
    applyOledBlack();
}
