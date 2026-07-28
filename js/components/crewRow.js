/* =====================================================================
   components/crewRow.js
   Reusable table-row renderer for a single crew member.
   Returns an HTML string consumed by the HOD admin table.
   ===================================================================== */

function renderCrewRow(member, index) {
    let badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (member.status === 'Approved') {
        badgeStyle = "bg-green-500/10 text-green-400 border-green-500/20";
    } else if (member.status === 'Declined') {
        badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20";
    }

    const regaliaCell = member.has_regalia
        ? '<span class="text-green-400 text-xs">Yes</span>'
        : `<span class="text-brand-gold font-mono">${member.regalia_size}</span>`;

    const receiptCell = member.regalia_receipt_url
        ? `<button onclick="viewReceipt('${member.regalia_receipt_url}')" class="h-8 w-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-black transition" title="View Receipt"><i class="fa-solid fa-file-image"></i></button>`
        : '<span class="text-[10px] text-gray-600">None</span>';

    const profileCell = `<button onclick="openProfileModal(${index})" class="h-8 w-8 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan hover:text-black transition" title="View Profile"><i class="fa-solid fa-user"></i></button>`;

    return `
        <tr class="hover:bg-white/[0.02] border-b border-brand-gold/10 transition">
            <td class="py-4 px-4" data-label="Serving No / Name">
                <span class="block text-brand-gold font-mono text-xs font-bold text-glow-gold">${member.serving_no}</span>
                <span class="block text-white font-semibold text-xs mt-0.5">${member.fullname}</span>
            </td>
            <td class="py-4 px-4 text-xs" data-label="Contact">
                <span class="block text-gray-300">${member.phone}</span>
                <span class="block text-[10px] text-gray-500 mt-0.5">Exp: ${member.history}</span>
            </td>
            <td class="py-4 px-4" data-label="Sector">
                <span class="block text-white text-xs">${member.area}</span>
                <span class="block text-[10px] text-gray-400 mt-0.5">${member.section}</span>
            </td>
            <td class="py-4 px-4" data-label="Gadget">
                <span class="block text-white text-xs">${member.gadget}</span>
                <span class="block text-[10px] text-gray-500 mt-0.5 font-mono">S/N: ${member.serial}</span>
            </td>
            <td class="py-4 px-4 text-xs font-bold text-center" data-label="Regalia">
                ${regaliaCell}
            </td>
            <td class="py-4 px-4" data-label="Status">
                <span class="px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}">
                    ${member.status}
                </span>
            </td>
            <td class="py-4 px-4 text-center" data-label="Receipt">
                ${receiptCell}
            </td>
            <td class="py-4 px-4 text-center" data-label="Profile">
                ${profileCell}
            </td>
            <td class="py-4 px-4" data-label="Actions">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="approveCrew(${index})" class="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition" title="Approve Server">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button onclick="openReassignModal(${index})" class="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-black transition" title="Reassign Sector">
                        <i class="fa-solid fa-arrows-spin"></i>
                    </button>
                    <button onclick="declineCrew(${index})" class="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition" title="Reject / Dismiss">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}
