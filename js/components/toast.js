/* =====================================================================
   components/toast.js
   Reusable high-performance toast alert.
   Auto-dismisses after a delay. Theme-aware (user vs HOD palette).
   ===================================================================== */

function renderToast(message, type) {
    const old = document.getElementById('system-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = "system-toast";

    const currentTabIsHOD = !document.getElementById('tab-admin').classList.contains('hidden');
    let baseColorClass = currentTabIsHOD
        ? 'bg-brand-carbon border-brand-gold/40 text-brand-gold'
        : 'bg-brand-slateDark border-brand-indigo/40 text-brand-cyan';

    if (type === 'success') {
        baseColorClass += ' shadow-[0_0_20px_rgba(34,197,94,0.3)]';
    } else if (type === 'warning') {
        baseColorClass += ' shadow-[0_0_20px_rgba(245,158,11,0.3)]';
    }

    toast.className = `fixed top-24 left-1/2 -translate-x-1/2 z-50 ${baseColorClass} border px-4 sm:px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 max-w-[90vw] animate-bounce transition-all duration-300`;
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 400);
    }, 3200);
}
