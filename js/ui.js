/* =====================================================================
   ui.js - Shared UI helpers
   Splash dismissal, HOD auth modal, generic confirm modal,
   and the email-dispatch log writer.
   ===================================================================== */

/* Welcome Splash Dismissal */
function dismissSplash() {
    const splash = document.getElementById('welcome-splash');
    splash.classList.add('opacity-0', 'pointer-events-none');
    renderToast("Welcome to International Overflow Connections", "success");
}

/* ---- HOD Secure Email Auth ---- */
function promptHODAuth() {
    if (uiState.isHODAuthenticated) {
        switchTab('admin');
    } else {
        document.getElementById('hod-auth-modal').classList.remove('hidden');
        document.getElementById('hod-auth-email').focus();
    }
}

function closeHODAuthModal() {
    document.getElementById('hod-auth-modal').classList.add('hidden');
}

function submitHODEmail(e) {
    e.preventDefault();
    const emailInput = document.getElementById('hod-auth-email');
    const emailValue = emailInput.value.trim();

    if (HOD_EMAIL_ALLOWLIST.includes(emailValue)) {
        uiState.isHODAuthenticated = true;
        uiState.hodLoggedInEmail = emailValue;
        uiState.hodLoggedInName = getHodName(emailValue);
        const nameEl = document.getElementById('hod-logged-in-name');
        if (nameEl) nameEl.textContent = uiState.hodLoggedInName;
        closeHODAuthModal();
        switchTab('admin');
        renderToast(`Access granted for ${uiState.hodLoggedInName}`, "success");
        logSystemEmail("Administrator Access", "HOD command", `Logged in via: ${emailValue}`);
    } else {
        renderToast("Access denied. You are not authorized to access the HOD Control Center.", "warning");
    }
}

/* ---- Generic Confirm Modal (promise-based) ---- */
function askConfirm(title, message) {
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-desc').textContent = message;
    document.getElementById('custom-confirm-modal').classList.remove('hidden');

    return new Promise((resolve) => {
        uiState.confirmActionPromiseResolve = resolve;
    });
}

function closeConfirmModal(outcome) {
    document.getElementById('custom-confirm-modal').classList.add('hidden');
    if (uiState.confirmActionPromiseResolve) {
        uiState.confirmActionPromiseResolve(outcome);
        uiState.confirmActionPromiseResolve = null;
    }
}

/* ---- HOD Secure Logout ---- */
async function logoutHOD() {
    const confirmed = await askConfirm("HOD Secure Logout", "Are you sure you want to end your active administrative command session and log out?");
    if (confirmed) {
        uiState.isHODAuthenticated = false;
        uiState.hodLoggedInEmail = null;
        uiState.hodLoggedInName = null;
        const nameEl = document.getElementById('hod-logged-in-name');
        if (nameEl) nameEl.textContent = '-';
        switchTab('register');
        renderToast("Logged out of HOD Control Center.", "success");
        logSystemEmail("Administrator Session", "System Security", "Administrative command session ended.");
    }
}

/* ---- Email Dispatch Log Writer (uses reusable component) ---- */
function logSystemEmail(name, area, alertType) {
    const container = document.getElementById('email-log-container');
    const box = renderEmailLogEntry(name, area, alertType);
    container.insertBefore(box, container.firstChild);
}
