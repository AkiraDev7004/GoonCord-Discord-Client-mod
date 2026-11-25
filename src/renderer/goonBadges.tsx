/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2026 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addProfileBadge, BadgeUserArgs } from "@vencord/types/api/Badges";
import { UserStore } from "@vencord/types/webpack/common";
/*
 * GoonCord: client-side only. Every badge here is shown on the profile of goonkatze, for
 * every user who runs GoonCord. Other profiles never show them, and clients without
 * GoonCord never see them.
 *
 * Nothing in this file may create React elements at module load: the renderer script
 * runs before Discord's React is available, so all JSX lives inside functions.
 */
import type { ReactElement } from "react";

const OWNER_USERNAME = "goonkatze";

// Every GoonCord client shows the badges on the profile of goonkatze, wherever it is seen.
// The profile is matched by username, so no user ID has to be stored or hardcoded.
const shownFor = new Set<string>();

function isOwnerProfile(userId: string): boolean {
    try {
        const match = UserStore.getUser(userId)?.username?.toLowerCase() === OWNER_USERNAME;
        if (match && !shownFor.has(userId)) {
            shownFor.add(userId);
            console.info("[GoonCord] goonkatze badges shown for profile", userId);
        }
        return match;
    } catch {
        return false;
    }
}

// ---- Badge artwork: own vector icons, 18x18. Built lazily inside functions. ----

type Icon = () => ReactElement;

const svg = (children: ReactElement) => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ margin: "0 2px", verticalAlign: "middle" }}>
        {children}
    </svg>
);

// A coloured disc with a white glyph on top
const disc =
    (fill: string, glyph: () => ReactElement): Icon =>
    () =>
        svg(
            <>
                <circle cx="9" cy="9" r="7.5" fill={fill} />
                {glyph()}
            </>
        );

// A shield with a glyph on top
const shield =
    (fill: string, glyph: () => ReactElement): Icon =>
    () =>
        svg(
            <>
                <path d="M9 1.5 L15.5 4 V8.5 C15.5 12.6 12.7 15.7 9 16.8 C5.3 15.7 2.5 12.6 2.5 8.5 V4 Z" fill={fill} />
                {glyph()}
            </>
        );

const W = { fill: "none", stroke: "#fff", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const G = {
    check: () => <path d="M5.5 9.2 L8 11.7 L12.5 6.8" {...W} />,
    star: () => (
        <polygon
            points="9,3.8 10.7,7.5 14.7,7.9 11.6,10.5 12.5,14.4 9,12.3 5.5,14.4 6.4,10.5 3.3,7.9 7.3,7.5"
            fill="#fff"
        />
    ),
    flame: () => (
        <path
            d="M9 3.8 C10.6 6 12.6 7.5 12.6 10.6 C12.6 13 11 14.6 9 14.6 C7 14.6 5.4 13 5.4 10.6 C5.4 9 6 8 6.8 7.2 C7 8.2 7.5 8.8 8.2 9 C7.8 7 8 5.4 9 3.8 Z"
            fill="#fff"
        />
    ),
    bolt: () => <polygon points="10.3,3.5 5.8,10 8.8,10 7.6,14.5 12.2,8 9.2,8" fill="#fff" />,
    gem: () => <polygon points="6,5.5 12,5.5 14.5,8.3 9,14.5 3.5,8.3" fill="#fff" />,
    crown: () => <polygon points="4.5,12.5 4,6.5 7,9 9,5 11,9 14,6.5 13.5,12.5" fill="#fff" />,
    gift: () => (
        <>
            <rect x="4.5" y="8" width="9" height="6" fill="#fff" />
            <rect x="3.5" y="6" width="11" height="2" fill="#fff" />
            <path d="M9 6 V14" stroke="#b07a00" strokeWidth="1" />
        </>
    ),
    clock: () => (
        <>
            <circle cx="9" cy="9" r="5.5" {...W} />
            <path d="M9 6.5 V9 L10.7 10" {...W} />
        </>
    ),
    hourglass: () => (
        <path
            d="M5.5 3.5 H12.5 M5.5 14.5 H12.5 M6.5 3.5 C6.5 7 9 8 9 9 C9 10 6.5 11 6.5 14.5 M11.5 3.5 C11.5 7 9 8 9 9 C9 10 11.5 11 11.5 14.5"
            {...W}
        />
    ),
    controller: () => (
        <path
            d="M4.5 8 H13.5 C15 8 15.5 9 15.5 10.3 C15.5 12.2 14.5 13 13.5 12.5 L12 11 H6 L4.5 12.5 C3.5 13 2.5 12.2 2.5 10.3 C2.5 9 3 8 4.5 8 Z"
            fill="#fff"
        />
    ),
    code: () => <path d="M6.5 6 L3.5 9 L6.5 12 M11.5 6 L14.5 9 L11.5 12 M10 5 L8 13" {...W} />,
    bug: () => (
        <>
            <ellipse cx="9" cy="10.5" rx="3" ry="3.8" fill="#fff" />
            <circle cx="9" cy="5.5" r="1.8" fill="#fff" />
        </>
    ),
    flask: () => (
        <path
            d="M7.5 3.5 H10.5 M8 3.5 V8 L4.8 13.3 C4.3 14.2 4.9 15 5.9 15 H12.1 C13.1 15 13.7 14.2 13.2 13.3 L10 8 V3.5"
            {...W}
        />
    ),
    trophy: () => (
        <path
            d="M6 4.5 H12 V7.5 C12 9.5 10.6 10.8 9 10.8 C7.4 10.8 6 9.5 6 7.5 Z M6 5.5 H4.5 C4.5 7 5 7.8 6.2 8 M12 5.5 H13.5 C13.5 7 13 7.8 11.8 8 M9 10.8 V13 M6.5 13.8 H11.5"
            {...W}
        />
    ),
    camera: () => (
        <>
            <rect x="3.5" y="6" width="11" height="7" rx="1.5" fill="#fff" />
            <circle cx="9" cy="9.5" r="2" fill="#333" />
        </>
    ),
    music: () => (
        <>
            <path d="M7.5 12.5 V5 L13 4 V11" {...W} />
            <circle cx="6.5" cy="12.5" r="1.5" fill="#fff" />
            <circle cx="11.5" cy="11" r="1.5" fill="#fff" />
        </>
    ),
    moon: () => (
        <path
            d="M11.5 3.5 C8 4 6 7 6.5 10.5 C7 13.5 10 15 13 14 C10 14 8 12 8 9 C8 6.5 9.5 4.5 11.5 3.5 Z"
            fill="#fff"
        />
    ),
    globe: () => (
        <>
            <circle cx="9" cy="9" r="5.5" {...W} />
            <ellipse cx="9" cy="9" rx="2.5" ry="5.5" {...W} />
            <path d="M3.5 9 H14.5" {...W} />
        </>
    ),
    paw: () => (
        <>
            <ellipse cx="9" cy="11" rx="3" ry="2.5" fill="#fff" />
            <circle cx="5.5" cy="7.5" r="1.2" fill="#fff" />
            <circle cx="7.5" cy="5" r="1.2" fill="#fff" />
            <circle cx="10.5" cy="5" r="1.2" fill="#fff" />
            <circle cx="12.5" cy="7.5" r="1.2" fill="#fff" />
        </>
    ),
    speech: () => <path d="M4 5.5 H14 V11.5 H8 L5.5 13.5 V11.5 H4 Z" fill="#fff" />,
    diamond: () => <polygon points="9,3.8 13.5,8 9,14.2 4.5,8" fill="#fff" />,
    hashtag: () => <path d="M6.5 2.5 L5.5 15.5 M12.5 2.5 L11.5 15.5 M3 6.5 H15.5 M2.5 11.5 H15" {...W} />,
    rocket: () => (
        <>
            <path d="M9 3.5 C11.5 5.5 12 8.5 11.3 11 L9 13.3 L6.7 11 C6 8.5 6.5 5.5 9 3.5 Z" fill="#fff" />
            <circle cx="9" cy="8" r="1.1" fill="#333" />
        </>
    ),
    leaf: () => <path d="M5 13 C5 7.5 8.5 4.5 13.5 4.5 C13.5 10 10 13 5 13 Z M5 13 L9 9" {...W} />,
    palette: () => (
        <>
            <circle cx="9" cy="9" r="5.5" fill="#fff" />
            <circle cx="7" cy="7" r="1" fill="#e91e63" />
            <circle cx="10.5" cy="6.8" r="1" fill="#3ba55c" />
            <circle cx="6.8" cy="10.5" r="1" fill="#5865f2" />
        </>
    )
};

// Shared "orb" gradient for Opal and Orbs
const gradients = () => (
    <defs>
        <radialGradient id="goon-opal" cx="35%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.5" stopColor="#b6f0ff" />
            <stop offset="1" stopColor="#c9b8ff" />
        </radialGradient>
        <radialGradient id="goon-orb" cx="35%" cy="35%" r="70%">
            <stop offset="0" stopColor="#fff7d1" />
            <stop offset="1" stopColor="#f0b232" />
        </radialGradient>
    </defs>
);

// ---- The badge set. Every badge is at its maxed tier and shown only for goonkatze. ----

type BadgeDef = { slug: string; name: string; description: string; icon: Icon };

const BADGES: BadgeDef[] = [
    // Discord's own badges (names as Discord shows them, staff renamed)
    {
        slug: "staff",
        name: "GoonCord Staff member",
        description: "GoonCord Staff member",
        icon: shield("#5865f2", G.check)
    },
    {
        slug: "partner",
        name: "Partnered Server Owner",
        description: "Partnered Server Owner",
        icon: disc("#f0b232", G.star)
    },
    {
        slug: "certified_moderator",
        name: "Certified Moderator",
        description: "Certified Moderator",
        icon: shield("#3ba55c", G.star)
    },
    {
        slug: "moderator_programs_alumni",
        name: "Moderator Programs Alumni",
        description: "Moderator Programs Alumni",
        icon: shield("#99aab5", G.clock)
    },
    { slug: "hypesquad", name: "HypeSquad Events", description: "HypeSquad Events", icon: disc("#9c84ef", G.flame) },
    {
        slug: "hypesquad_bravery",
        name: "HypeSquad Bravery",
        description: "HypeSquad Bravery",
        icon: svgHouse("#9c84ef")
    },
    {
        slug: "hypesquad_brilliance",
        name: "HypeSquad Brilliance",
        description: "HypeSquad Brilliance",
        icon: svgHouse("#f47b67")
    },
    {
        slug: "hypesquad_balance",
        name: "HypeSquad Balance",
        description: "HypeSquad Balance",
        icon: svgHouse("#45ddc0")
    },
    {
        slug: "bug_hunter_2",
        name: "Bug Hunter Level 2",
        description: "Bug Hunter Level 2",
        icon: disc("#23a55a", G.bug)
    },
    {
        slug: "early_supporter",
        name: "Early Supporter",
        description: "Early Supporter",
        icon: disc("#e91e63", G.clock)
    },
    {
        slug: "early_verified_bot_dev",
        name: "Early Verified Bot Developer",
        description: "Early Verified Bot Developer",
        icon: disc("#5865f2", G.code)
    },
    {
        slug: "active_developer",
        name: "Active Developer",
        description: "Active Developer",
        icon: disc("#5865f2", G.code)
    },
    {
        slug: "verified_developer",
        name: "Verified Developer",
        description: "Verified Developer",
        icon: disc("#5865f2", G.check)
    },
    {
        slug: "legacy_username",
        name: "Legacy Username",
        description: "Legacy Username",
        icon: disc("#72767d", G.hashtag)
    },
    {
        slug: "quest_completed",
        name: "Quest Completed",
        description: "Quest Completed",
        icon: disc("#23a55a", G.check)
    },
    {
        slug: "orb",
        name: "Orbs",
        description: "Orbs",
        icon: () => svg(<circle cx="9" cy="9" r="7.5" fill="url(#goon-orb)" />)
    },

    // Maxed tiers
    {
        slug: "nitro_opal",
        name: "Opal",
        description: "Nitro: Opal",
        icon: () =>
            svg(
                <>
                    {gradients()}
                    <circle cx="9" cy="9" r="7.5" fill="url(#goon-opal)" />
                    {G.bolt}
                </>
            )
    },
    {
        slug: "server_booster_24",
        name: "Server Booster 24+ Monate",
        description: "24+ Monate Server-Boost",
        icon: disc("#ff73fa", G.gem)
    },
    { slug: "gifter_legend", name: "Legende", description: "20+ Geschenke", icon: disc("#f0b232", G.gift) },
    {
        slug: "account_age_ancient",
        name: "Urzeitlich",
        description: "10+ Jahre Account",
        icon: disc("#8b5e3c", G.hourglass)
    },
    {
        slug: "games_universalist",
        name: "Universalist",
        description: "100+ gespielte Spiele",
        icon: disc("#3ba55c", G.controller)
    },

    // Extra badges, all goonkatze only
    { slug: "founder", name: "GoonCord Gründer", description: "Gründer von GoonCord", icon: disc("#f0b232", G.crown) },
    {
        slug: "developer",
        name: "GoonCord Developer",
        description: "Entwickler von GoonCord",
        icon: disc("#5865f2", G.code)
    },
    { slug: "beta_tester", name: "Beta Tester", description: "Beta-Tester", icon: disc("#9c84ef", G.flask) },
    { slug: "early_adopter", name: "Early Adopter", description: "Früh dabei", icon: disc("#e91e63", G.rocket) },
    {
        slug: "top_contributor",
        name: "Top Contributor",
        description: "Top-Beitragender",
        icon: disc("#f0b232", G.trophy)
    },
    { slug: "streamer", name: "Streamer", description: "Streamer", icon: disc("#593695", G.camera) },
    { slug: "music_lover", name: "Musikliebhaber", description: "Musikliebhaber", icon: disc("#f47b67", G.music) },
    { slug: "night_owl", name: "Nachteule", description: "Nachteule", icon: disc("#2c2f5a", G.moon) },
    { slug: "explorer", name: "Weltenbummler", description: "Weltenbummler", icon: disc("#45ddc0", G.globe) },
    { slug: "cat_person", name: "Katzenmensch", description: "Katzenmensch", icon: disc("#f47b67", G.paw) },
    { slug: "diamond", name: "Diamant", description: "Diamant", icon: disc("#45ddc0", G.diamond) },
    { slug: "pro_gamer", name: "Pro Gamer", description: "Pro Gamer", icon: disc("#3ba55c", G.controller) },
    { slug: "chatterbox", name: "Quasselstrippe", description: "Viel geschrieben", icon: disc("#5865f2", G.speech) },
    { slug: "artist", name: "Künstler", description: "Künstler", icon: disc("#e91e63", G.palette) },
    { slug: "nature_lover", name: "Naturliebhaber", description: "Naturliebhaber", icon: disc("#23a55a", G.leaf) }
];

// House shape for the three HypeSquad houses
function svgHouse(fill: string): Icon {
    return () => svg(<path d="M9 1.5 L16 7 V16.5 H2 V7 Z" fill={fill} />);
}

for (const badge of BADGES) {
    const id = `goon_${badge.slug}`;
    try {
        addProfileBadge({
            id,
            key: id,
            name: badge.name,
            description: badge.description,
            detail: "GoonCord client badge",
            component: function GoonBadge() {
                return badge.icon();
            },
            shouldShow: (args: BadgeUserArgs) => isOwnerProfile(args.userId)
        });
    } catch (err) {
        console.error("GoonCord: failed to register badge", id, err);
    }
}
console.info(`[GoonCord] ${BADGES.length} goonkatze badges registered`);
