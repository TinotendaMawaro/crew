/* =====================================================================
   components/emailLogEntry.js
   Reusable "email dispatch" log entry for the HOD audit panel.
   Returns a DOM element so callers can prepend it to the log container.
   ===================================================================== */

function renderEmailLogEntry(name, area, alertType) {
    const box = document.createElement('div');
    box.className = "flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5 text-gray-400";
    box.innerHTML = `
        <i class="fa-solid fa-paper-plane text-brand-gold mt-0.5 animate-pulse"></i>
        <div>
            <span class="text-white font-semibold">Email Dispatch:</span> Transmitted welcome deployment packet to <strong>${name}</strong> inside sector <strong>'${area}'</strong>. Action: <strong>${alertType}</strong>.
            <span class="block text-[10px] text-brand-gold mt-1 font-mono">STATUS: INBOX_DELIVERED &bull; JUST NOW</span>
        </div>
    `;
    return box;
}
