/* =====================================================================
   theme.js - Dynamic visual theme transformation
   Swaps the whole portal between the "User Glow" (indigo/cyan)
   palette and the "HOD Command" (royal gold / velvet) palette.
   ===================================================================== */

function switchTab(tabId) {
    const registerTab = document.getElementById('tab-register');
    const adminTab = document.getElementById('tab-admin');
    const navBtnReg = document.getElementById('nav-btn-register');
    const navBtnAdmin = document.getElementById('nav-btn-admin');
    const navBtnLogout = document.getElementById('nav-btn-logout');

    const body = document.getElementById('main-body');
    const nav = document.getElementById('nav-bar');
    const logo = document.getElementById('nav-logo');

    const blob1 = document.getElementById('bg-blob-1');
    const blob2 = document.getElementById('bg-blob-2');
    const blob3 = document.getElementById('bg-blob-3');

    if (tabId === 'register') {
        // User Interface Theme (Blue-Indigo)
        adminTab.classList.add('hidden');
        registerTab.classList.remove('hidden');

        body.className = "bg-brand-darkSpace text-gray-100 font-sans min-h-screen selection:bg-brand-cyan selection:text-black antialiased custom-scrollbar relative overflow-x-hidden transition-theme";
        nav.className = "sticky top-0 z-40 bg-brand-darkSpace/90 border-b border-brand-indigo/30 backdrop-blur-xl px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between transition-theme";
        logo.className = "h-20 w-20 bg-gradient-to-tr from-brand-indigo to-brand-cyan rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-brand-cyan/40 transition-theme";

        blob1.className = "absolute top-10 left-10 w-[450px] h-[450px] bg-brand-indigo/15 rounded-full blur-[110px] ambient-glow-circle pointer-events-none z-0 transition-theme";
        blob2.className = "absolute top-1/3 right-10 w-[550px] h-[550px] bg-brand-indigo/10 rounded-full blur-[130px] ambient-glow-circle pointer-events-none z-0 transition-theme";
        blob3.className = "absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-brand-cyan/15 rounded-full blur-[100px] ambient-glow-circle pointer-events-none z-0 transition-theme";

        navBtnReg.className = "px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-bold border-2 border-brand-indigo bg-brand-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center gap-2";
        navBtnAdmin.className = "px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-bold border border-brand-indigo/35 text-gray-300 hover:border-brand-cyan hover:text-brand-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center gap-2";

        navBtnAdmin.classList.remove('hidden');
        navBtnLogout.classList.add('hidden');

        document.documentElement.style.setProperty('--scroll-color', '#6366f1');
        document.getElementById('pwa-theme-color').setAttribute('content', '#6366f1');
        if (window.GlobeAPI) window.GlobeAPI.setTheme(false);
        if (window.ParticlesAPI) window.ParticlesAPI.setTheme(false);
    } else {
        // Command Gold / Charcoal Velvet (HOD Theme)
        registerTab.classList.add('hidden');
        adminTab.classList.remove('hidden');

        body.className = "bg-brand-carbonDark text-gray-200 font-sans min-h-screen selection:bg-brand-gold selection:text-black antialiased custom-scrollbar relative overflow-x-hidden transition-theme";
        nav.className = "sticky top-0 z-40 bg-brand-carbonDark/90 border-b border-brand-gold/30 backdrop-blur-xl px-4 sm:px-8 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between transition-theme";
        logo.className = "h-20 w-20 bg-gradient-to-tr from-brand-goldDark to-brand-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-brand-gold/40 transition-theme";

        blob1.className = "absolute top-10 left-10 w-[450px] h-[450px] bg-brand-goldDark/10 rounded-full blur-[110px] ambient-glow-circle pointer-events-none z-0 transition-theme";
        blob2.className = "absolute top-1/3 right-10 w-[550px] h-[550px] bg-brand-velvet/20 rounded-full blur-[130px] ambient-glow-circle pointer-events-none z-0 transition-theme";
        blob3.className = "absolute bottom-10 left-1/3 w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[100px] ambient-glow-circle pointer-events-none z-0 transition-theme";

        navBtnReg.className = "px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-bold border border-brand-gold/35 text-gray-300 hover:border-brand-gold hover:text-brand-gold hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 flex items-center gap-2";

        navBtnAdmin.classList.add('hidden');
        navBtnLogout.classList.remove('hidden');

        document.documentElement.style.setProperty('--scroll-color', '#f59e0b');
        document.getElementById('pwa-theme-color').setAttribute('content', '#f59e0b');
        if (window.GlobeAPI) window.GlobeAPI.setTheme(true);
        if (window.ParticlesAPI) window.ParticlesAPI.setTheme(true);

        renderAdminTable();
    }
}
