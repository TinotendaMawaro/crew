/* =====================================================================
   config.js - Shared state, constants and Supabase config
   ===================================================================== */

/* Supabase connection (publishable/anon key is safe for browser use).
   Override at runtime with: window.__SUPABASE__ = { url, key } */
const SUPABASE_URL = (window.__SUPABASE__ && window.__SUPABASE__.url) ||
    "https://auoxtszkyavpebvnzkcg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = (window.__SUPABASE__ && window.__SUPABASE__.key) ||
    "sb_publishable_ALAkPvyiXUnMQ8M5fYFYpQ_PXxTqsN0";

const CREW_TABLE = "crew_registrations";

/* Sector definitions used by registration + HOD reassign flows */
const sectionsData = {
    "Visual Production": [
        "Videography",
        "Photography",
        "Live streaming",
        "Logistics",
        "Projection"
    ],
    "Audio Engineering": [
        "FOH Audio Engineer",
        "Monitor Audio Tech",
        "Broadcast Mix Engineer",
        "Stage Audio Assistant"
    ],
    "Social Media & PR": [
        "Content Creator / Copywriter",
        "Live Stream Coordinator",
        "Shorts/Reels Videographer",
        "Graphics Designer"
    ],
    "Lighting & Stage FX": [
        "Lighting Designer / Console Op",
        "Rigging Technician",
        "Stage Assistant"
    ],
    "IT Support": [
        "Networking",
        "Software Support",
        "Hardware Support"
            ]
};

/* Crew registry is owned by the Supabase data layer (see js/supabase.js).
   `registeredCrew` is a local cache kept in sync with the backend. */
let registeredCrew = [];

/* HOD authorized account metadata */
const HOD_ACCOUNTS = [
    { email: 'holyhappy@gmail.com', name: 'Farai Mutsvene' },
    { email: 'tmawaro25@gmail.com', name: 'Tinotenda Mawaro' },
    { email: 'donmaminimini@gmail.com', name: 'Pastor Maminimini' }
];

const HOD_EMAIL_ALLOWLIST = HOD_ACCOUNTS.map(account => account.email);

/* Shared UI state */
const uiState = {
    currentStep: 1,
    selectedRegaliaChoice: true,
    selectedPaymentMethod: 'ecocash',
    currentEditingIndex: -1,
    profileViewingIndex: -1,
    isHODAuthenticated: false,
    hodLoggedInEmail: null,
    hodLoggedInName: null,
    confirmActionPromiseResolve: null
};

function getHodName(email) {
    const account = HOD_ACCOUNTS.find(account => account.email === email);
    return account ? account.name : email;
}
