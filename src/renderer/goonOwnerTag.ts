/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/*
 * GoonCord: shows a small "GoonCord owner" tag with a check mark next to the name goonkatze,
 * like the BOT tag next to bot names. Shown for every GoonCord user, wherever the name appears.
 */

const OWNER_USERNAME = "goonkatze";
const TAG_CLASS = "goon-owner-tag";

function addTags(root: ParentNode) {
    for (const el of Array.from(root.querySelectorAll("span, div, h1, h2, h3"))) {
        if (el.childElementCount !== 0) continue;
        if ((el.textContent ?? "").trim().toLowerCase() !== OWNER_USERNAME) continue;
        if (el.nextElementSibling?.classList.contains(TAG_CLASS)) continue;

        const tag = document.createElement("span");
        tag.className = TAG_CLASS;
        tag.textContent = "✓ GoonCord owner";
        Object.assign(tag.style, {
            display: "inline-block",
            marginLeft: "6px",
            padding: "1px 5px",
            borderRadius: "4px",
            background: "#5865f2",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "700",
            lineHeight: "14px",
            verticalAlign: "middle",
            whiteSpace: "nowrap"
        });
        el.insertAdjacentElement("afterend", tag);
    }
}

let scheduled = false;
function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
        scheduled = false;
        try {
            addTags(document.body);
        } catch (err) {
            console.error("GoonCord: owner tag failed", err);
        }
    });
}

function start() {
    schedule();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
    start();
}

export {};
