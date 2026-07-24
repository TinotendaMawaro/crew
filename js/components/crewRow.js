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

    const regaliaCell = member.hasRegalia
        ? '<span class="text-green-400 text-xs">Yes</span>'
        : `<span class="text-brand-gold font-mono">${member.regaliaSize}</span>`;

    return `
        <tr class="hover:bg-white/[0.02] border-b border-brand-gold/10 transition">
            <td class="py-4 px-4">
                <span class="block text-brand-gold font-mono text-xs font-bold text-glow-gold">${member.servingNo}</span>
                <span class="block text-white font-semibold text-xs mt-0.5">${member.fullname}</span>
            </td>
            <td class="py-4 px-4 text-xs">
                <span class="block text-gray-300">${member.phone}</span>
                <span class="block text-[10px] text-gray-500 mt-0.5">Exp: ${member.history}</span>
            </td>
            <td class="py-4 px-4">
                <span class="block text-white text-xs">${member.area}</span>
                <span class="block text-[10px] text-gray-400 mt-0.5">${member.section}</span>
            </td>
            <td class="py-4 px-4">
                <span class="block text-white text-xs">${member.gadget}</span>
                <span class="block text-[10px] text-gray-500 mt-0.5 font-mono">S/N: ${member.serial}</span>
            </td>
            <td class="py-4 px-4 text-xs font-bold text-center">
                ${regaliaCell}
            </td>
            <td class="py-4 px-4">
                <span class="px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}">
                    ${member.status}
                </span>
            </td>
            <td class="py-4 px-4">
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
