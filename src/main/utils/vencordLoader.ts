/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { mkdirSync } from "fs";
import { access, constants as FsConstants, copyFile, rename, writeFile } from "fs/promises";
import { join } from "path";

import { VENCORD_FILES_DIR } from "main/vencordFilesDir";
import { STATIC_DIR } from "shared/paths";

import { USER_AGENT } from "../constants";
import { downloadFile, fetchie } from "./http";

const API_BASE = "https://api.github.com";

export const FILES_TO_DOWNLOAD = [
    "vencordDesktopMain.js",
    "vencordDesktopPreload.js",
    "vencordDesktopRenderer.js",
    "vencordDesktopRenderer.css"
];

export interface ReleaseData {
    name: string;
    tag_name: string;
    html_url: string;
    assets: Array<{
        name: string;
        browser_download_url: string;
    }>;
}

export async function githubGet(endpoint: string) {
    const opts: RequestInit = {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": USER_AGENT
        }
    };

    if (process.env.GITHUB_TOKEN) (opts.headers! as any).Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    return fetchie(API_BASE + endpoint, opts, { retryOnNetworkError: true });
}

// GoonCord ships its own build of the Vencord runtime (static/runtime), so nothing is fetched from GitHub.
const BUNDLED_RUNTIME_DIR = join(STATIC_DIR, "runtime");

export async function downloadVencordFiles() {
    if (await isValidVencordInstall(BUNDLED_RUNTIME_DIR)) {
        mkdirSync(VENCORD_FILES_DIR, { recursive: true });
        await Promise.all(
            FILES_TO_DOWNLOAD.map(f => copyFile(join(BUNDLED_RUNTIME_DIR, f), join(VENCORD_FILES_DIR, f)))
        );
        await writeFile(join(VENCORD_FILES_DIR, "package.json"), "{}");
        return;
    }

    const release = await githubGet("/repos/Vendicated/Vencord/releases/latest");

    const { assets }: ReleaseData = await release.json();
    const files = assets.filter(({ name }) => FILES_TO_DOWNLOAD.some(f => name.startsWith(f)));

    mkdirSync(VENCORD_FILES_DIR, { recursive: true });

    // Download to temp files and only move them into place once all succeeded,
    // so an interrupted download can't leave a broken install behind
    const results = await Promise.allSettled(
        files.map(({ name, browser_download_url }) =>
            downloadFile(
                browser_download_url,
                join(VENCORD_FILES_DIR, name + ".tmp"),
                {},
                { retryOnNetworkError: true }
            )
        )
    );
    const failed = results.find(r => r.status === "rejected");
    if (failed) throw failed.reason;

    await Promise.all(
        files.map(({ name }) => rename(join(VENCORD_FILES_DIR, name + ".tmp"), join(VENCORD_FILES_DIR, name)))
    );
    await writeFile(join(VENCORD_FILES_DIR, "package.json"), "{}");
}

const existsAsync = (path: string) =>
    access(path, FsConstants.F_OK)
        .then(() => true)
        .catch(() => false);

export async function isValidVencordInstall(dir: string) {
    const results = await Promise.all(FILES_TO_DOWNLOAD.map(f => existsAsync(join(dir, f))));
    return !results.includes(false);
}
