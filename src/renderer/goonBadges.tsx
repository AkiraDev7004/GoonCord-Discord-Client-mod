/*
 * GoonCord, a Discord client based on Vesktop
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Client-side only. The badges are shown only on the profile of the account that
 * owns this client (goonkatze). The owner ID is remembered per install, so the badges
 * stay visible after switching to another account. Other users never see them.
 *
 * Nothing in this file may create React elements at module load: the renderer script
 * runs before Discord's React is available, so all JSX lives inside functions.
 */
import type { ReactElement } from "react";

import { addProfileBadge, BadgeUserArgs } from "@vencord/types/api/Badges";
import { UserStore } from "@vencord/types/webpack/common";

const OWNER_USERNAME = "goonkatze";
const OWNER_ID_KEY = "goon_owner_id";

function getOwnerId(): string | null {
    try {
        const me = UserStore.getCurrentUser();
        if (me?.username === OWNER_USERNAME) {
            localStorage.setItem(OWNER_ID_KEY, me.id);
            return me.id;
        }
        return localStorage.getItem(OWNER_ID_KEY);
    } catch {
        return null;
    }
}

function isOwnerProfile(userId: string): boolean {
    return getOwnerId() === userId;
}

// ---- Badge artwork: own simple vector icons, 18x18. Each icon is a function so JSX is only built on render. ----

type Icon = () => ReactElement;

const svg = (children: ReactElement) => (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ margin: "0 2px", verticalAlign: "middle" }}>
        {children}
    </svg>
);

const SHIELD = "M9 1.5 L15.5 4 V8.5 C15.5 12.6 12.7 15.7 9 16.8 C5.3 15.7 2.5 12.6 2.5 8.5 V4 Z";
const GEM = "5.5,2.5 12.5,2.5 16,7.5 9,16 2,7.5";
const BOLT = "10.5,1.5 3.5,10 8.5,10 7,16.5 14.5,7.5 9.5,7.5";

const ICONS: Record<string, Icon> = {
    // shield with check: staff
    staff: () => svg(<>
        <path d={SHIELD} fill="#5865f2" />
        <path d="M5.8 9 L8 11.2 L12.2 6.9" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>),
    // star: partner
    partner: () => svg(<polygon points="9,1.5 11.2,6.4 16.5,6.8 12.5,10.3 13.7,15.5 9,12.8 4.3,15.5 5.5,10.3 1.5,6.8 6.8,6.4" fill="#f0b232" />),
    // shield with star: certified moderator
    certified_moderator: () => svg(<>
        <path d={SHIELD} fill="#3ba55c" />
        <polygon points="9,5 9.9,7.2 12.2,7.4 10.4,8.9 11,11.2 9,9.9 7,11.2 7.6,8.9 5.8,7.4 8.1,7.2" fill="#fff" />
    </>),
    // plain shield with clock: moderator programs alumni
    moderator_programs_alumni: () => svg(<>
        <path d={SHIELD} fill="#99aab5" />
        <circle cx="9" cy="9" r="3.2" fill="none" stroke="#fff" strokeWidth="1.4" />
        <path d="M9 7.2 V9 L10.3 9.9" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
    </>),
    // flame: HypeSquad events
    hypesquad: () => svg(<path d="M9 1.5 C11 4.5 13.8 6.2 13.8 10.2 C13.8 13.5 11.6 16.5 9 16.5 C6.4 16.5 4.2 13.5 4.2 10.2 C4.2 8.3 5 6.8 6.2 5.5 C6.4 7 7.2 8 8 8 C7.4 5.6 7.7 3.5 9 1.5 Z" fill="#9c84ef" />),
    // house shapes for the three HypeSquad houses
    hypesquad_bravery: () => svg(<path d="M9 1.5 L16 7 V16.5 H2 V7 Z" fill="#9c84ef" />),
    hypesquad_brilliance: () => svg(<path d="M9 1.5 L16 7 V16.5 H2 V7 Z" fill="#f47b67" />),
    hypesquad_balance: () => svg(<path d="M9 1.5 L16 7 V16.5 H2 V7 Z" fill="#45ddc0" />),
    // bug: bug hunter level 1 / 2
    bug_hunter_1: () => svg(<>
        <ellipse cx="9" cy="10.5" rx="4" ry="5" fill="#3ba55c" />
        <circle cx="9" cy="4.5" r="2.2" fill="#3ba55c" />
        <path d="M2 7 L5.5 8.5 M16 7 L12.5 8.5 M2 13 L5.5 12 M16 13 L12.5 12" stroke="#3ba55c" strokeWidth="1.4" />
    </>),
    bug_hunter_2: () => svg(<>
        <ellipse cx="9" cy="10.5" rx="4" ry="5" fill="#23a55a" />
        <circle cx="9" cy="4.5" r="2.2" fill="#23a55a" />
        <path d="M2 7 L5.5 8.5 M16 7 L12.5 8.5 M2 13 L5.5 12 M16 13 L12.5 12" stroke="#23a55a" strokeWidth="1.4" />
        <circle cx="9" cy="10.5" r="1.4" fill="#fff" />
    </>),
    // clock: early supporter
    early_supporter: () => svg(<>
        <circle cx="9" cy="9" r="7.5" fill="#e91e63" />
        <path d="M9 4.5 V9 L12 10.8" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>),
    // robot head: early verified bot developer
    early_verified_bot_dev: () => svg(<>
        <rect x="3" y="5" width="12" height="10" rx="2.5" fill="#5865f2" />
        <rect x="8.5" y="1.5" width="1" height="3.5" fill="#5865f2" />
        <circle cx="6.5" cy="9.5" r="1.4" fill="#fff" />
        <circle cx="11.5" cy="9.5" r="1.4" fill="#fff" />
    </>),
    // code brackets: active developer
    active_developer: () => svg(<path d="M6 5 L2 9 L6 13 M12 5 L16 9 L12 13 M10.5 3.5 L7.5 14.5" fill="none" stroke="#5865f2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />),
    // verified check in a circle: verified developer
    verified_developer: () => svg(<>
        <circle cx="9" cy="9" r="7.5" fill="#5865f2" />
        <path d="M5.2 9.2 L7.8 11.7 L12.8 6.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>),
    // hashtag: legacy username
    legacy_username: () => svg(<path d="M6.5 2.5 L5.5 15.5 M12.5 2.5 L11.5 15.5 M3 6.5 H15.5 M2.5 11.5 H15" stroke="#b5bac1" strokeWidth="1.6" strokeLinecap="round" />),
    // lightning bolt: Nitro
    nitro: () => svg(<polygon points={BOLT} fill="#ff73fa" />),
    // quest scroll: quest completed
    quest_completed: () => svg(<>
        <rect x="3.5" y="2" width="11" height="14" rx="1.5" fill="#23a55a" />
        <path d="M6 6 H12 M6 9 H12 M6 12 H10" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
    </>),
    // sphere: orbs
    orb: () => svg(<>
        <defs>
            <radialGradient id="goon-orb" cx="35%" cy="35%" r="70%">
                <stop offset="0" stopColor="#fff7d1" />
                <stop offset="1" stopColor="#f0b232" />
            </radialGradient>
        </defs>
        <circle cx="9" cy="9" r="7.5" fill="url(#goon-orb)" />
    </>)
};

// Gem with a level number: server booster levels 1-9
const boostIcon = (level: number): Icon => () => svg(<>
    <polygon points={GEM} fill="#ff73fa" />
    <text x="9" y="10.6" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#fff">{level}</text>
</>);

// Bolt with a month count: Nitro subscriber tiers
const nitroIcon = (months: number): Icon => () => svg(<>
    <polygon points={BOLT} fill="#ff73fa" />
    <text x="9" y="10.8" fontSize="5" fontWeight="700" textAnchor="middle" fill="#2b2d31">{months}</text>
</>);

// The badge set with the same names Discord uses.
const BASE_BADGES: { slug: string; name: string }[] = [
    { slug: "staff", name: "Discord Staff" },
    { slug: "partner", name: "Partnered Server Owner" },
    { slug: "certified_moderator", name: "Certified Moderator" },
    { slug: "moderator_programs_alumni", name: "Moderator Programs Alumni" },
    { slug: "hypesquad", name: "HypeSquad Events" },
    { slug: "hypesquad_bravery", name: "HypeSquad Bravery" },
    { slug: "hypesquad_brilliance", name: "HypeSquad Brilliance" },
    { slug: "hypesquad_balance", name: "HypeSquad Balance" },
    { slug: "bug_hunter_1", name: "Bug Hunter Level 1" },
    { slug: "bug_hunter_2", name: "Bug Hunter Level 2" },
    { slug: "early_supporter", name: "Early Supporter" },
    { slug: "early_verified_bot_dev", name: "Early Verified Bot Developer" },
    { slug: "active_developer", name: "Active Developer" },
    { slug: "verified_developer", name: "Verified Developer" },
    { slug: "legacy_username", name: "Legacy Username" },
    { slug: "nitro", name: "Nitro" },
    { slug: "quest_completed", name: "Quest Completed" },
    { slug: "orb", name: "Orbs" }
];

const ALL_BADGES: { slug: string; name: string; icon: Icon }[] = [
    ...BASE_BADGES.map(b => ({ ...b, icon: ICONS[b.slug] })),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => ({
        slug: `server_booster_${level}`,
        name: `Server Booster Level ${level}`,
        icon: boostIcon(level)
    })),
    ...[1, 2, 3, 6, 9, 12, 15, 18, 24].map(months => ({
        slug: `nitro_${months}_months`,
        name: `Nitro Subscriber (${months} ${months === 1 ? "month" : "months"})`,
        icon: nitroIcon(months)
    }))
];

for (const badge of ALL_BADGES) {
    const id = `goon_${badge.slug}`;
    try {
        addProfileBadge({
            id,
            key: id,
            name: badge.name,
            description: badge.name,
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
