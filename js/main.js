/* =====================================================================
   main.js - Bootstrap / initialization
   Wires up PWA, initial render, countdown tick, and seed logs.
   ===================================================================== */

/* Remove the full-screen loading spinner once the app is ready */
function dismissAppLoader() {
    const loader = document.getElementById('app-loader');
    if (!loader || loader.dataset.dismissed) return;
    loader.dataset.dismissed = 'true';
    loader.classList.add('loader-fade-out');
    setTimeout(() => loader.remove(), 500);
}

window.addEventListener('DOMContentLoaded', () => {
    initPWA();
    initSupabase();
    initSectionDependency();
    runCountdown();
    setInterval(runCountdown, 1000);

    // Seed initial dispatch transactions
    logSystemEmail("Tapiwa Charles", "Visual Production", "Authorized Flight Credentials");
    logSystemEmail("Grace Chipo", "Social Media & PR", "Authorized Flight Credentials");

    // Load crew from Supabase, then render the admin table
    (async () => {
        await loadAndRenderCrew();
        // App logic is wired up; ensure loader stays for exactly 3 seconds
        setTimeout(dismissAppLoader, 3000);
    })();

    // Safety fallback so the spinner never gets stuck if the network hangs
    setTimeout(dismissAppLoader, 3000);
});
