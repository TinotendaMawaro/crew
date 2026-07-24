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
        "Main Camera Operator",
        "Live Switcher Operator",
        "Crane Cameraman",
        "NDI Network Engineer",
        "Projection Specialist"
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
    ]
};

/* Crew registry is owned by the Supabase data layer (see js/supabase.js).
   `registeredCrew` is a local cache kept in sync with the backend. */
let registeredCrew = [];

/* Shared UI state */
const uiState = {
    currentStep: 1,
    selectedRegaliaChoice: true,
    currentEditingIndex: -1,
    isHODAuthenticated: false,
    confirmActionPromiseResolve: null
};
